import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { CreateVariantsDto, UpdateVariantDto } from './dto';

import { ReservationStatus } from '../stock-reservations/enum/reservation-status.enum';

import { SizesService } from '../sizes/sizes.service';
import { FilesService } from '../../files/files.service';
import { ColorsService } from '../colors/colors.service';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { Variant } from './entities/variant.entity';
import { ProductColor } from './entities/product-color.entity';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,

    @InjectRepository(ProductColor)
    private readonly productColorRepository: Repository<ProductColor>,

    private sizeService: SizesService,
    private colorService: ColorsService,
    private filesService: FilesService,
    private dataSource: DataSource,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createVariantsDto: CreateVariantsDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { variants, multimedia, productId, ...data } = createVariantsDto;

      //! se crea el color (si no existe)
      const color = await this.colorService.create({
        code: data.colorCode,
        name: data.colorName,
      });

      //! se crea el product-color
      const productColor = queryRunner.manager.create(ProductColor, {
        product: { id: productId },
        color: { id: color?.id },
        multimedia,

        //! se crean las variants
        variants: await Promise.all(
          variants.map(async (size) => {
            const sizeEntity = await this.sizeService.create({
              name: size.size,
            });
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
  //?                         FindAll Product Colors                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAllProductColors(pagination: PaginationDto) {
    const productColors = await this.productColorRepository.find({
      relations: { variants: { size: true }, color: true, product: true },
    });

    //! se mapea y se agrega el stock disponible
    const result = await Promise.all(
      productColors.map(async (productColor) => {
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
      }),
    );

    return result;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
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
  //?                           FindOneProductColor                                                  */
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
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(id: number, updateVariantDto: UpdateVariantDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { multimedia, variants } = updateVariantDto;

      //! se obtiene el entity con sus relaciones
      const productColorEntity = await this.findOneProductColor(id);

      if (multimedia) {
        //! se borran físicamente los archivos si hay multimedia
        await this.filesService.deletedFiles(productColorEntity.multimedia);
        productColorEntity.multimedia = multimedia;
        await queryRunner.manager.save(productColorEntity);
      }

      //! se recorren los variants para crear nuevos
      if (variants && variants.length > 0) {
        for (const variant of variants) {
          const sizeEntity = await this.sizeService.create({
            name: variant.size,
          });

          //! se crean los variants
          const variantEntity = queryRunner.manager.create(Variant, {
            size: { id: sizeEntity?.id },
            productColor: { id: productColorEntity.id },
            transactions: [{ quantity: variant.quantity }],
          });

          await queryRunner.manager.save(variantEntity);
        }
      }

      //! se retorna el entity actualizado
      const productColor = await queryRunner.manager.findOne(ProductColor, {
        where: { id },
        relations: { variants: { size: true } },
      });
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
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const productColorEntity = await this.findOneProductColor(id);

    try {
      //! se borran físicamente los archivos
      if (productColorEntity.multimedia) {
        await this.filesService.deletedFiles(productColorEntity.multimedia);
        productColorEntity.multimedia = [];
        await queryRunner.manager.save(productColorEntity);
      }

      await queryRunner.manager.softRemove(productColorEntity);
      await queryRunner.commitTransaction();

      return {
        message: 'Product-Color and Variants deleted successfully',
        deleted: productColorEntity, //! devuelve sin multimedias
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
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
          ), 0)
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

  async getAvailableStockWithLock(
    queryRunner: QueryRunner,
    variantId: number,
  ): Promise<number> {
    //! Bloquear las reservas existentes para esta variante
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

    //! Calcular stock disponible (sin FOR UPDATE en agregaciones)
    const result = await queryRunner.manager.query(
      `
      SELECT
          COALESCE((SELECT SUM(t.quantity) 
            FROM transactions t 
            WHERE t."variantId" = $1), 0)
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
}
