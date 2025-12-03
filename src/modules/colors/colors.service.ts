import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { CreateColorDto, UpdateColorDto } from './dto';

import { Color } from './entities/color.entity';

@Injectable()
export class ColorsService {
  constructor(
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createColorDto: CreateColorDto, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Color) : this.colorRepository;
    const { name, code } = createColorDto;

    try {
      const colorExists = await repo.findOne({ where: { name, code } });

      if (!colorExists) {
        const newColor = repo.create(createColorDto);
        return await repo.save(newColor);
      }

      return colorExists;
    } catch (error) {
      handleDBExceptions(error);
      throw error;
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: PaginationDto) {
    //const { limit = 10, offset = 0 } = pagination;

    const colors = await this.colorRepository.find({
      //take: limit,
      //skip: offset,
    });

    return colors;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const color = await this.colorRepository.findOne({
      where: { id },
    });
    if (!color) {
      throw new NotFoundException('Color not found');
    }
    return color;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(id: number, updateColorDto: UpdateColorDto) {
    const color = await this.findOne(id);
    try {
      Object.assign(color, updateColorDto);
      return await this.colorRepository.save(color);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async remove(id: number) {
    const color = await this.findOne(id);
    try {
      await this.colorRepository.softRemove(color);
      return {
        message: 'Color deleted successfully',
        deleted: color,
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
