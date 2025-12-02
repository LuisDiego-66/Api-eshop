import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCategoryDto, UpdateCategoryDto } from './dto';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const { gender } = createCategoryDto;

      //! Obtener el valor máximo actual de displayOrder para la categoría dada
      const maxOrder = await this.categoryRepository
        .createQueryBuilder('c')
        .select('COALESCE(MAX(c.displayOrder), 0)', 'max')
        .where('c.gender = :gender', { gender })
        .getRawOne();

      const newCategory = this.categoryRepository.create({
        ...createCategoryDto,
        displayOrder: Number(maxOrder.max) + 1,
      });
      return await this.categoryRepository.save(newCategory);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll() {
    const categories = await this.categoryRepository.find({
      relations: { subcategories: true },
    });

    return categories;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: {
        subcategories: {
          products: { productColors: { color: true }, discount: true },
        },
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    try {
      const { image, ...data } = updateCategoryDto;

      if (image) {
        category.image = image;
      }

      Object.assign(category, { ...data });
      return await this.categoryRepository.save(category);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                          Update Display Order                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async updateDisplayOrder(id: number, newOrder: number) {
    const category = await this.findOne(id);
    const oldOrder = category.displayOrder;
    if (oldOrder === newOrder) return category;

    if (newOrder > oldOrder) {
      // --------------------------------------------
      // 1. Mover hacia abajo → desplazar los de en medio hacia arriba
      // --------------------------------------------
      await this.categoryRepository
        .createQueryBuilder()
        .update(Category)
        .set({ displayOrder: () => '"displayOrder" - 1' })
        .where('"gender" = :gender', { gender: category.gender })
        .andWhere('"displayOrder" > :oldOrder', { oldOrder })
        .andWhere('"displayOrder" <= :newOrder', { newOrder })
        .execute();
    } else {
      // --------------------------------------------
      // 2. Mover hacia arriba → desplazar los de en medio hacia abajo
      // --------------------------------------------

      await this.categoryRepository
        .createQueryBuilder()
        .update(Category)
        .set({ displayOrder: () => '"displayOrder" + 1' })
        .where('"gender" = :gender', { gender: category.gender })
        .andWhere('"displayOrder" >= :newOrder', { newOrder })
        .andWhere('"displayOrder" < :oldOrder', { oldOrder })
        .execute();
    }

    await this.categoryRepository.update(category.id, {
      displayOrder: newOrder,
    });
    return this.findAll();
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Delete                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async remove(id: number) {
    const category = await this.findOne(id);

    try {
      category.displayOrder = 0;

      await this.categoryRepository.softRemove(category);

      await this.categoryRepository
        .createQueryBuilder()
        .update(Category)
        .set({ displayOrder: () => '"displayOrder" - 1' })
        .where('"gender" = :gender', { gender: category.gender })
        .andWhere('"displayOrder" > :order', { order: category.displayOrder })
        .execute();

      return {
        message: 'Category deleted successfully',
        deleted: category,
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
