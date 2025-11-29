import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';

import { paginateAdvanced } from 'src/common/pagination/paginate-advanced';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/paginate';
import { CreateVariantsDto, UpdateVariantDto } from './dto';

import { ReservationStatus } from '../stock-reservations/enum/reservation-status.enum';

import { ColorsService } from '../colors/colors.service';
import { SizesService } from '../sizes/sizes.service';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { ProductColor } from './entities/product-color.entity';
import { Transaction } from './entities/transaction.entity';
import { Variant } from './entities/variant.entity';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(ProductColor)
    private readonly productColorRepository: Repository<ProductColor>,

    private sizeService: SizesService,
    private colorService: ColorsService,
    private dataSource: DataSource,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                           Create_ProdcutColor                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async createProductColor(createVariantsDto: CreateVariantsDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { variants, multimedia, productId, pdfs, ...data } =
        createVariantsDto;

      // --------------------------------------------------------------------------
      // 1. Se crea el color (si no existe)
      // --------------------------------------------------------------------------

      const color = await this.colorService.create(
        {
          code: data.colorCode,
          name: data.colorName,
        },
        queryRunner.manager,
      );

      // --------------------------------------------------------------------------
      // 2. Se crea el product-color
      // --------------------------------------------------------------------------

      const productColor = queryRunner.manager.create(ProductColor, {
        product: { id: productId },
        color: { id: color?.id },
        multimedia,
        pdfs,

        // --------------------------------------------------------------------------
        // 3. Se crean las variants
        // --------------------------------------------------------------------------

        variants: await Promise.all(
          variants.map(async (size) => {
            const sizeEntity = await this.sizeService.create(
              {
                name: size.size,
              },
              queryRunner.manager,
            );
            return {
              size: { id: sizeEntity?.id },
              transactions: [{ quantity: size.quantity }],
            };
          }),
        ),
      });

      await queryRunner.manager.save(productColor);

      await queryRunner.commitTransaction();
      return productColor;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                          FindAll_ProductColors                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAllProductColors(paginationDto: PaginationDto) {
    // --------------------------------------------------------------------------
    // 1. Busca por <qr>idProduct</qr>
    // --------------------------------------------------------------------------

    if (paginationDto.search) {
      const variantId = this.getIdProductoByQr(paginationDto.search);

      if (variantId) {
        return await this.findProductColorsForVariant(paginationDto, variantId);
      }
    }

    const paginated = await paginateAdvanced(
      this.productColorRepository,
      paginationDto,
      ['product.name'], //* campos buscables (en relaciones)
      ['variants.size', 'color', 'product'], //* relaciones
      { id: 'ASC' }, //* orden
      true, //* caseInsensitive
    );

    // --------------------------------------------------------------------------
    // 2. Calcula el stock solo para los resultados paginados
    // --------------------------------------------------------------------------

    const dataWithStock = await this.addStockToProductColors(paginated.data);

    // --------------------------------------------------------------------------
    // 3. Devuelve los resultados paginados con la meta
    // --------------------------------------------------------------------------

    return {
      data: dataWithStock,
      meta: paginated.meta,
    };
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                FindOne_Variant                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOneVariant(id: number) {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: { productColor: { product: { discount: true } }, size: true },
    });
    if (!variant) {
      throw new NotFoundException('Variant not found: ' + id);
    }
    return variant;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                           FindOne_ProductColor                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOneProductColor(id: number) {
    const productColor = await this.productColorRepository.findOne({
      where: { id },
      relations: { variants: { size: true }, product: true, color: true },
    });

    if (!productColor) {
      throw new NotFoundException('Product-Color not found: ' + id);
    }
    return productColor;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //? ---------------------------------------------------------------------------------------------- */

  async findOneProductColorWithStock(id: number) {
    const productColor = await this.productColorRepository.findOne({
      where: { id },
      relations: { variants: { size: true }, product: true, color: true },
    });

    if (!productColor) {
      throw new NotFoundException('Product-Color not found: ' + id);
    }

    // --------------------------------------------------------------------------
    // 1. Mapea las variantes para añadir el stock disponible
    // --------------------------------------------------------------------------

    const variantsWithStock = await Promise.all(
      productColor.variants.map(async (variant) => {
        const availableStock = await this.getAvailableStock(variant.id);
        return {
          ...variant,
          availableStock,
        };
      }),
    );

    return {
      ...productColor,
      variants: variantsWithStock,
    };
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                           Update_ProductColor                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async updateProductColor(id: number, updateVariantDto: UpdateVariantDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { multimedia, variants, pdfs, ...data } = updateVariantDto;

      // --------------------------------------------------------------------------
      // 1. Obtener el ProductColor
      // --------------------------------------------------------------------------

      const productColorEntity = await this.findOneProductColor(id);

      // --------------------------------------------------------------------------
      // 2. Se crea el color (si no existe)
      // --------------------------------------------------------------------------

      if (data.colorCode && data.colorName) {
        const color = await this.colorService.create(
          { code: data.colorCode, name: data.colorName },
          queryRunner.manager,
        );
        productColorEntity.color = color;
      }

      if (multimedia) {
        productColorEntity.multimedia = multimedia;
      }
      if (pdfs) {
        productColorEntity.pdfs = pdfs;
      }

      const productColor = await queryRunner.manager.save(
        ProductColor,
        productColorEntity,
      );

      // --------------------------------------------------------------------------
      // 3. Crear nuevas variantes si se envían
      // --------------------------------------------------------------------------

      if (variants && variants.length > 0) {
        const variantEntities = await Promise.all(
          variants.map(async (variant) => {
            const sizeEntity = await this.sizeService.create({
              name: variant.size,
            });

            return queryRunner.manager.create(Variant, {
              size: { id: sizeEntity.id },
              productColor: productColor,

              transactions: [{ quantity: variant.quantity }],
            });
          }),
        );
        await queryRunner.manager.save(Variant, variantEntities);
      }

      await queryRunner.commitTransaction();

      // --------------------------------------------------------------------------
      // 4. Se retorna el entity actualizado
      // --------------------------------------------------------------------------

      return await queryRunner.manager.findOne(ProductColor, {
        where: { id },
        relations: { variants: { size: true } },
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                              Get_Best_Sellers                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async getBestSellers() {
    // --------------------------------------------------------------------------
    // 1. Se obtienen las variants mas vendidas y su stock vendido
    // --------------------------------------------------------------------------
    const limit = 10;

    const result = await this.transactionRepository
      .createQueryBuilder('t')
      .select('t.variantId', 'variantId')
      .addSelect('ABS(SUM(t.quantity))', 'sales')

      .innerJoin('t.variant', 'v')
      .innerJoin('t.order', 'o')

      .where('t.quantity < 0')

      .groupBy('t.variantId')
      .addGroupBy('v.id')
      .orderBy('sales', 'DESC')
      .limit(limit)
      .getRawMany();

    // --------------------------------------------------------------------------
    // 2. Se obtienen las variants completas
    // --------------------------------------------------------------------------

    const topVariantIds = result.map((r) => r.variantId);
    const variants = await this.variantRepository.find({
      where: { id: In(topVariantIds) },
      relations: { productColor: { product: true } },
    });

    // --------------------------------------------------------------------------
    // 3. Se inserta el stock vendido y se devuelve ordenado
    // --------------------------------------------------------------------------

    return topVariantIds.map((id) => {
      const v = variants.find((v) => v.id === id);
      const stockEntry = result.find((r) => r.variantId === id);
      return {
        ...v,
        sale: stockEntry ? Number(stockEntry.sales) : 0,
      };
    });
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                 Get_low_stock                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async getLowStock() {
    // --------------------------------------------------------------------------
    // 1. Se obtienen las variants con menor stock actual
    // --------------------------------------------------------------------------

    const limit = 10;

    const result = await this.transactionRepository
      .createQueryBuilder('t')
      .select('t.variantId', 'variantId')
      .addSelect('SUM(t.quantity)', 'stock') // stock actual
      .innerJoin('t.variant', 'v')
      .where('t.deletedAt IS NULL')
      .groupBy('t.variantId')
      .orderBy('stock', 'ASC') // de menor a mayor
      .limit(limit)
      .getRawMany();

    // --------------------------------------------------------------------------
    // 2. Se obtienen las variants completas
    // --------------------------------------------------------------------------

    const topVariantIds = result.map((r) => r.variantId);
    const variants = await this.variantRepository.find({
      where: { id: In(topVariantIds) },
      relations: { productColor: { product: true } },
    });

    // --------------------------------------------------------------------------
    // 3. Se inserta el stock vendido y se devuelve ordenado
    // --------------------------------------------------------------------------

    return topVariantIds.map((id) => {
      const v = variants.find((v) => v.id === id);
      const stockEntry = result.find((r) => r.variantId === id);
      return {
        ...v,
        stock: stockEntry ? Number(stockEntry.stock) : 0,
      };
    });
  }

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Functions                                               */
  //* ---------------------------------------------------------------------------------------------- */

  async getAvailableStock(variantId: number): Promise<number> {
    await this.findOneVariant(variantId);
    const result = await this.variantRepository.query(
      `
        SELECT 
          COALESCE((
            SELECT SUM(t.quantity) 
            FROM transactions t 
            WHERE t."variantId" = v.id
              AND t."deletedAt" IS NULL), 0)
          -
          COALESCE((
            SELECT SUM(sr.quantity) 
            FROM stock_reservations sr 
            WHERE sr."variantId" = v.id
              AND sr.status = $2
              AND sr."expiresAt" > NOW()
          ), 0)
          AS available_stock
        FROM variants v
        WHERE v.id = $1
      `,
      [variantId, ReservationStatus.PENDING],
    );
    return Number(result[0]?.available_stock ?? 0);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //? ---------------------------------------------------------------------------------------------- */

  async getAvailableStockWithLock(
    queryRunner: QueryRunner,
    variantId: number,
  ): Promise<number> {
    // --------------------------------------------------------------------------
    // 1. Bloquear las reservas existentes para esta variante
    // --------------------------------------------------------------------------

    await queryRunner.manager.query(
      `
      SELECT 1
      FROM stock_reservations sr
      WHERE sr."variantId" = $1
        AND sr.status IN ($2)
        AND (sr.status != $2 OR sr."expiresAt" > NOW())
      FOR UPDATE
      `,
      [variantId, ReservationStatus.PENDING],
    );

    // --------------------------------------------------------------------------
    // 2. Calcular stock disponible (sin FOR UPDATE en agregaciones)
    // --------------------------------------------------------------------------

    const result = await queryRunner.manager.query(
      `
      SELECT
          COALESCE((SELECT SUM(t.quantity) 
            FROM transactions t 
            WHERE t."variantId" = $1
            AND t."deletedAt" IS NULL), 0)
        - 
        COALESCE((SELECT SUM(sr.quantity) 
            FROM stock_reservations sr 
            WHERE sr."variantId" = $1 
              AND sr.status = $2 
              AND sr."expiresAt" > NOW()), 0)
              AS available_stock
      `,
      [variantId, ReservationStatus.PENDING],
    );
    return Number(result[0]?.available_stock ?? 0);
  }

  //? ---------------------------------------------------------------------------------------------- */
  //? ---------------------------------------------------------------------------------------------- */

  private getIdProductoByQr(texto: string): number | null {
    const regex = /^<qr>(\d+)<\/qr>$/;
    const coincidencia = texto.match(regex);
    if (coincidencia && coincidencia[1]) {
      return parseInt(coincidencia[1], 10);
    }
    return null;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //? ---------------------------------------------------------------------------------------------- */

  private async findProductColorsForVariant(
    pagination: PaginationDto,
    variantId: number,
  ) {
    // --------------------------------------------------------------------------
    // 1. paginacion normal
    // --------------------------------------------------------------------------

    const productColors = await paginate(
      this.productColorRepository,
      {
        //where: { product: { id: productId } },
        where: {
          variants: { id: variantId },
        },
        relations: { variants: { size: true }, product: true, color: true },
      },
      pagination,
    );

    // --------------------------------------------------------------------------
    // 2. Mapea las variantes para añadir el stock disponible
    // --------------------------------------------------------------------------

    const productColorsWithStock = await this.addStockToProductColors(
      productColors.data,
    );

    return {
      data: productColorsWithStock,
      meta: productColors.meta,
    };
  }

  //? ---------------------------------------------------------------------------------------------- */
  //? ---------------------------------------------------------------------------------------------- */

  async addStockToProductColors(producColors: ProductColor[]) {
    const dataWithStock = await Promise.all(
      producColors.map(async (productColor) => {
        const variantsWithStock = await Promise.all(
          productColor.variants.map(async (variant) => {
            const availableStock = await this.getAvailableStock(variant.id);
            return { ...variant, availableStock };
          }),
        );

        return { ...productColor, variants: variantsWithStock };
      }),
    );
    return dataWithStock;
  }
}
