import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
//? ---------------------------------------------------------------------------------------------- */
import { Subcategory } from './entities/subcategory.entity';
//? ---------------------------------------------------------------------------------------------- */
import { PaginationDto } from 'src/common/dtos/pagination';
import { CreateSubcategoryDto, UpdateSubcategoryDto } from './dto';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createSubcategoryDto: CreateSubcategoryDto) {
    try {
      const newSubCategory = this.subcategoryRepository.create({
        ...createSubcategoryDto,
        category: { id: createSubcategoryDto.category }, //!  category is a number, not an object
      });
      return await this.subcategoryRepository.save(newSubCategory);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;

    const subCategories = await this.subcategoryRepository.find({
      take: limit,
      skip: offset,
      relations: { products: true },
    });

    return subCategories;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const subCategory = await this.subcategoryRepository.findOne({
      where: { id },
      relations: { products: true },
    });
    if (!subCategory) {
      throw new NotFoundException('Subcategory not found');
    }
    return subCategory;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(id: number, updateSubcategoryDto: UpdateSubcategoryDto) {
    const subCategory = await this.findOne(id);
    try {
      Object.assign(subCategory, updateSubcategoryDto);
      return await this.subcategoryRepository.save(subCategory);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async remove(id: number) {
    const subCategory = await this.findOne(id);
    try {
      await this.subcategoryRepository.softRemove(subCategory);
      return {
        message: 'Category deleted successfully',
        deleted: subCategory,
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        DBExceptions                                            */
  //* ---------------------------------------------------------------------------------------------- */

  private handleDBExceptions(error: any) {
    if (error.code === '23503') throw new ConflictException(error.detail); //! key not exist

    throw new InternalServerErrorException(error.message);
  }
}
