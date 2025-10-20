import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { CreateBrandDto, UpdateBrandDto } from './dto';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { Brand } from './entities/brand.entity';

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
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: PaginationDto) {
    const brands = await this.brandRepository.find({
      relations: { products: true },
    });

    return brands;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const brand = await this.brandRepository.findOne({
      where: { id },
      relations: { products: true },
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
      handleDBExceptions(error);
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
      handleDBExceptions(error);
    }
  }
}
