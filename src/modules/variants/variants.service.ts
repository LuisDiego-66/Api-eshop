import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';

import { PaginationDto } from 'src/common/dtos/pagination';
import { CreateVariantsDto, UpdateVariantDto } from './dto';

import { ReservationStatus } from '../stock-reservations/enum/reservation-status.enum';

import { SizesService } from '../sizes/sizes.service';
import { FilesService } from '../../files/files.service';

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
      const { variants, multimedia, productId, colorId } = createVariantsDto;

      const productColor = await queryRunner.manager.create(ProductColor, {
        product: { id: productId },
        color: { id: colorId },
        multimedia,

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
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;

    const variants = await this.productColorRepository.find({
      take: limit,
      skip: offset,
      relations: { variants: { size: true } },
    });
    return variants;
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

  async findOneProductColor(id: number) {
    const productColor = await this.productColorRepository.findOne({
      where: { id },
      relations: { variants: true, product: true },
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
    const variantProductColorEntity = await this.findOneProductColor(id);

    const { multimedia } = updateVariantDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (multimedia) {
        //! se borran físicamente los archivos
        await this.filesService.deletedFiles(
          variantProductColorEntity.multimedia,
        );
        variantProductColorEntity.multimedia = [];
      }

      Object.assign(variantProductColorEntity, updateVariantDto);
      const variant = await queryRunner.manager.save(variantProductColorEntity);

      await queryRunner.commitTransaction();

      return variant;
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
    const productColorEntity = await this.findOneProductColor(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

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
        message: 'Variant deleted successfully',
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
          ), 0)
          -
          COALESCE((
            SELECT SUM(sr.quantity) 
            FROM stock_reservations sr 
            WHERE sr."variantId" = v.id
              AND sr.status = $3
              AND sr."expiresAt" > NOW()
          ), 0)
          AS available_stock
        FROM variants v
        WHERE v.id = $1
      `,
      [variantId, ReservationStatus.PAID, ReservationStatus.PENDING],
    );
    return Number(result[0]?.available_stock ?? 0);
  }

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
        AND sr.status IN ($2, $3)
        AND (sr.status != $3 OR sr."expiresAt" > NOW())
      FOR UPDATE
      `,
      [variantId, ReservationStatus.PAID, ReservationStatus.PENDING],
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
              AND sr.status = $2), 0)
        - 
        COALESCE((SELECT SUM(sr.quantity) 
            FROM stock_reservations sr 
            WHERE sr."variantId" = $1 
              AND sr.status = $3 
              AND sr."expiresAt" > NOW()), 0)
              AS available_stock
      `,
      [variantId, ReservationStatus.PAID, ReservationStatus.PENDING],
    );
    return Number(result[0]?.available_stock ?? 0);
  }
}
