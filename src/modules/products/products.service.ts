import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/paginate';
import { AddDiscountsDto, CreateProductDto, UpdateProductDto } from './dto';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { Discount } from '../discounts/entities/discount.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private dataSource: DataSource,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                Create Product                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async createProduct(createProductDto: CreateProductDto) {
    try {
      const newProduct = this.productRepository.create({
        ...createProductDto,
        subcategory: { id: createProductDto.subcategory }, //! Is a number, not an object
        brand: { id: createProductDto.brand },
        discount: { id: createProductDto.discount },
      });
      return await this.productRepository.save(newProduct);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: PaginationDto) {
    return paginate(
      this.productRepository,
      {
        relations: {
          subcategory: { category: true },
          discount: true,
          productColors: true,
        },
      },
      pagination,
      ['name'], //! busqueda por:
    );
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                       FindOne Product Variants                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOneProductVariants(id: number) {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productColors', 'pc')
      .leftJoinAndSelect('pc.color', 'color')
      .leftJoinAndSelect('pc.variants', 'variant')
      .leftJoinAndSelect('variant.size', 'size')
      .where('product.id = :id', { id: id })
      .getOne();
    return product;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        productColors: { variants: { size: true }, color: true },
        subcategory: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Update                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    try {
      Object.assign(product, updateProductDto);
      return await this.productRepository.save(product);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                  AddDiscounts                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async addDiscounts(addDiscountsDto: AddDiscountsDto) {
    const { productsIds, discountId } = addDiscountsDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //! Verificar que el descuento exista
      const discountEntity = await queryRunner.manager.findOne(Discount, {
        where: { id: discountId },
      });
      if (!discountEntity)
        throw new NotFoundException(`Discount with ID ${discountId} not found`);

      //! Buscar los productos
      const products = await queryRunner.manager.find(Product, {
        where: { id: In(productsIds) },
      });
      if (products.length === 0)
        throw new NotFoundException('No products found with given IDs');

      //! Verificar que existan todos los IDs
      const foundIds = products.map((p) => p.id);
      const missingIds = productsIds.filter((id) => !foundIds.includes(id));
      if (missingIds.length > 0)
        throw new NotFoundException(
          `Products not found: [${missingIds.join(', ')}]`,
        );

      //! Actualización masiva con un solo UPDATE
      await queryRunner.manager
        .createQueryBuilder()
        .update(Product)
        .set({ discount: discountEntity })
        .whereInIds(productsIds)
        .execute();

      await queryRunner.commitTransaction();

      return {
        message: 'Discount applied successfully to products',
        count: products.length,
        products: products.map((p) => ({ id: p.id, name: p.name })),
      };
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
    const product = await this.findOne(id);
    try {
      await this.productRepository.softRemove(product);
      return {
        message: 'Product deleted successfully',
        deleted: product,
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }
}
