import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationDto } from 'src/common/dtos/pagination';
import { CreateProductDto, UpdateProductDto } from './dto';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
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
    const { limit = 10, offset = 0 } = pagination;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
    });

    return products;
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
      relations: { productColors: { variants: true, color: true } },
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
