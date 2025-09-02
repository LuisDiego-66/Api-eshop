import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { PaginationDto } from 'src/common/dtos/pagination';
import { CreateOutfitDto, UpdateOutfitDto } from './dto';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { Outfit } from './entities/outfit.entity';
import { Variant } from '../variants/entities/variant.entity';

@Injectable()
export class OutfitsService {
  constructor(
    @InjectRepository(Outfit)
    private readonly outfitRepository: Repository<Outfit>,

    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,

    private readonly dataSourse: DataSource,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createOutfitDto: CreateOutfitDto) {
    try {
      const variants = await this.variantRepository.findByIds(
        createOutfitDto.variantIds,
      );

      if (variants.length !== createOutfitDto.variantIds.length) {
        throw new NotFoundException('Some variant does not exist');
      }

      const outfit = this.outfitRepository.create({
        ...createOutfitDto,
        variants,
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
    const { limit = 10, offset = 0 } = pagination;

    const outfits = await this.outfitRepository.find({
      take: limit,
      skip: offset,
      relations: { variants: true },
    });

    return outfits;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const outfit = await this.outfitRepository.findOne({
      where: { id },
      relations: { variants: true },
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
    const { variantIds } = updateOutfitDto;
    const outfitEntity = await this.findOne(id);

    const queryRunner = this.dataSourse.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (variantIds) {
        outfitEntity.variants = [];
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
