import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';

import { PaginationDto } from 'src/common/dtos/pagination';
import { CreateVariantDto, UpdateVariantDto } from './dto';

import { ReservationStatus } from '../stock-reservations/enum/reservation-status.enum';

import { FilesService } from '../../files/files.service';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { Variant } from './entities/variant.entity';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    private readonly filesService: FilesService,
    private readonly dataSourse: DataSource,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createVariantDto: CreateVariantDto) {
    try {
      const { multimedia, ...data } = createVariantDto;

      const newVariant = this.variantRepository.create({
        ...data,
        product: { id: createVariantDto.product },
        color: { id: createVariantDto.color },
        size: { id: createVariantDto.size },
        multimedia,
      });
      return await this.variantRepository.save(newVariant);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;

    const variants = await this.variantRepository.find({
      take: limit,
      skip: offset,
      relations: { product: true, color: true, size: true },
    });

    return variants;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: { product: { discount: true }, color: true, size: true },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found: ' + id);
    }

    return variant;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(id: number, updateVariantDto: UpdateVariantDto) {
    const { multimedia } = updateVariantDto;
    const variantEntity = await this.findOne(id);

    const queryRunner = this.dataSourse.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (multimedia) {
        //! se borran físicamente los archivos
        await this.filesService.deletedFiles(variantEntity.multimedia);
        variantEntity.multimedia = [];
      }

      Object.assign(variantEntity, updateVariantDto);
      const variant = await queryRunner.manager.save(variantEntity);

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
    const variantEntity = await this.findOne(id);
    const { multimedia } = variantEntity;

    const queryRunner = this.dataSourse.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //! se borran físicamente los archivos
      if (multimedia) {
        await this.filesService.deletedFiles(multimedia);
        variantEntity.multimedia = [];
        await queryRunner.manager.save(variantEntity);
      }

      await queryRunner.manager.softRemove(variantEntity);
      await queryRunner.commitTransaction();

      return {
        message: 'Variant deleted successfully',
        deleted: variantEntity, //! devuelve sin multimedias
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
    await this.findOne(variantId);
    const result = await this.variantRepository.query(
      `
        SELECT 
          COALESCE((
            SELECT SUM(i.quantity) 
            FROM incomes i 
            WHERE i."variantId" = v.id
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
          COALESCE((SELECT SUM(i.quantity) 
            FROM incomes i 
            WHERE i."variantId" = $1), 0)
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
