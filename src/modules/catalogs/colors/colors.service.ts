import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { PaginationDto } from 'src/common/dtos/pagination';
import { InjectRepository } from '@nestjs/typeorm';
import { Color } from './entities/color.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ColorsService {
  constructor(
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createColorDto: CreateColorDto) {
    try {
      const newColor = this.colorRepository.create(createColorDto);
      return await this.colorRepository.save(newColor);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;

    const colors = await this.colorRepository.find({
      take: limit,
      skip: offset,
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
      this.handleDBExceptions(error);
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
      this.handleDBExceptions(error);
    }
  }

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        DBExceptions                                            */
  //* ---------------------------------------------------------------------------------------------- */

  private handleDBExceptions(error: any) {
    throw new InternalServerErrorException(
      'Unexpected Error, check server Logs:' + error.message,
    );
  }
}
