import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationDto } from 'src/common/dtos/pagination';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createBrandDto: CreateBrandDto) {
    try {
      const newBrand = this.brandRepository.create(createBrandDto);
      return await this.brandRepository.save(newBrand);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;

    const brands = await this.brandRepository.find({
      take: limit,
      skip: offset,
      relations: ['products'],
    });

    return brands;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const brand = await this.brandRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    const brand = await this.findOne(id);
    try {
      Object.assign(brand, updateBrandDto);
      return await this.brandRepository.save(brand);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async remove(id: number) {
    const brand = await this.findOne(id);
    try {
      await this.brandRepository.softRemove(brand);
      return {
        message: 'Brand deleted successfully',
        deleted: brand,
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        DBExceptions                                            */
  //* ---------------------------------------------------------------------------------------------- */

  private handleDBExceptions(error: any) {
    if (error.code == '23505') throw new ConflictException(error.detail); // unique violation

    throw new InternalServerErrorException(
      'Unexpected Error, check server Logs:' + error.message,
    );
  }
}
