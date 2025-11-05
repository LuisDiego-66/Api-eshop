import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { CreateOutfitDto, UpdateOutfitDto } from './dto';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { Outfit } from './entities/outfit.entity';
import { ProductColor } from '../variants/entities/product-color.entity';

@Injectable()
export class OutfitsService {
  constructor(
    @InjectRepository(Outfit)
    private readonly outfitRepository: Repository<Outfit>,

    @InjectRepository(ProductColor)
    private readonly productColorRepository: Repository<ProductColor>,

    private readonly dataSourse: DataSource,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createOutfitDto: CreateOutfitDto) {
    try {
      const productColors = await this.productColorRepository.findByIds(
        createOutfitDto.productColorIds,
      );

      if (productColors.length !== createOutfitDto.productColorIds.length) {
        throw new NotFoundException('Some Product-Colors does not exist');
      }

      const outfit = this.outfitRepository.create({
        ...createOutfitDto,
        productColors,
      });
      return await this.outfitRepository.save(outfit);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */
  async findAll(pagination: PaginationDto) {
    //const { limit = 10, offset = 0 } = pagination;

    const outfits = await this.outfitRepository.find({
      //take: limit,
      //skip: offset,
      relations: { productColors: true },
    });

    return outfits;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const outfit = await this.outfitRepository.findOne({
      where: { id },
      relations: { productColors: true },
    });

    if (!outfit) {
      throw new NotFoundException('Outfit not found: ' + id);
    }

    return outfit;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(id: number, updateOutfitDto: UpdateOutfitDto) {
    const { productColorIds } = updateOutfitDto;
    const outfitEntity = await this.findOne(id);

    const queryRunner = this.dataSourse.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (productColorIds) {
        outfitEntity.productColors =
          await this.productColorRepository.findByIds(productColorIds);
      }

      Object.assign(outfitEntity, updateOutfitDto);
      const outfit = await queryRunner.manager.save(outfitEntity);

      await queryRunner.commitTransaction();

      return outfit;
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
    const outfitEntity = await this.findOne(id);

    const queryRunner = this.dataSourse.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.softRemove(outfitEntity);
      await queryRunner.commitTransaction();

      return {
        message: 'Outfit deleted successfully',
        deleted: outfitEntity,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }
}
