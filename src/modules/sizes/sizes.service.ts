import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { CreateSizeDto, UpdateSizeDto } from './dto';

import { Size } from './entities/size.entity';

@Injectable()
export class SizesService {
  constructor(
    @InjectRepository(Size)
    private readonly sizeRepository: Repository<Size>,
  ) {}

  //? ============================================================================================== */
  //?                                        Create                                                  */
  //? ============================================================================================== */

  async create(createSizeDto: CreateSizeDto, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Size) : this.sizeRepository;
    let { name } = createSizeDto;
    name = name.toUpperCase().trim();

    try {
      const sizeExists = await repo.findOne({ where: { name } });

      if (!sizeExists) {
        const newSize = repo.create(createSizeDto);
        return await repo.save(newSize);
      }

      return sizeExists;
    } catch (error) {
      handleDBExceptions(error);
      throw error;
    }
  }

  //? ============================================================================================== */
  //?                                        FindAll                                                 */
  //? ============================================================================================== */

  async findAll(pagination: PaginationDto) {
    //const { limit = 10, offset = 0 } = pagination;

    const sizes = await this.sizeRepository.find({
      //take: limit,
      //skip: offset,
    });

    return sizes;
  }

  //? ============================================================================================== */
  //?                                        FindOne                                                 */
  //? ============================================================================================== */

  async findOne(id: number) {
    const size = await this.sizeRepository.findOne({
      where: { id },
    });
    if (!size) {
      throw new NotFoundException('Size not found');
    }
    return size;
  }

  //? ============================================================================================== */
  //?                                        Update                                                  */
  //? ============================================================================================== */

  async update(id: number, updateSizeDto: UpdateSizeDto) {
    const size = await this.findOne(id);
    try {
      Object.assign(size, updateSizeDto);
      return await this.sizeRepository.save(size);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ============================================================================================== */
  //?                                        Delete                                                  */
  //? ============================================================================================== */

  async remove(id: number) {
    const size = await this.findOne(id);
    try {
      await this.sizeRepository.softRemove(size);
      return {
        message: 'Size deleted successfully',
        deleted: size,
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
