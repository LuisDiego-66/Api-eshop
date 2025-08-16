import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
//? ---------------------------------------------------------------------------------------------- */
import { Size } from './entities/size.entity';
//? ---------------------------------------------------------------------------------------------- */
import { PaginationDto } from 'src/common/dtos/pagination';
import { CreateSizeDto, UpdateSizeDto } from './dto';

@Injectable()
export class SizesService {
  constructor(
    @InjectRepository(Size)
    private readonly sizeRepository: Repository<Size>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createSizeDto: CreateSizeDto) {
    try {
      const newSize = this.sizeRepository.create(createSizeDto);
      return await this.sizeRepository.save(newSize);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;

    const sizes = await this.sizeRepository.find({
      take: limit,
      skip: offset,
    });

    return sizes;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const size = await this.sizeRepository.findOne({
      where: { id },
    });
    if (!size) {
      throw new NotFoundException('Size not found');
    }
    return size;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(id: number, updateSizeDto: UpdateSizeDto) {
    const size = await this.findOne(id);
    try {
      Object.assign(size, updateSizeDto);
      return await this.sizeRepository.save(size);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async remove(id: number) {
    const size = await this.findOne(id);
    try {
      await this.sizeRepository.softRemove(size);
      return {
        message: 'Size deleted successfully',
        deleted: size,
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        DBExceptions                                            */
  //* ---------------------------------------------------------------------------------------------- */

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new ConflictException(error.detail); //! Duplicate key error (unique)

    throw new InternalServerErrorException(error.message);
  }
}
