import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createProductDto: CreateProductDto) {
    try {
      const newProduct = this.productRepository.create({
        ...createProductDto,
        subcategory: { id: createProductDto.subcategory }, //! Is a number, not an object
        brand: { id: createProductDto.brand },
        discounts: { id: createProductDto.discount },
      });
      return await this.productRepository.save(newProduct);
    } catch (error) {
      this.handleDBExceptions(error);
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
      relations: ['brand', 'discounts', 'variants'],
    });

    return products;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['variants'],
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
      this.handleDBExceptions(error);
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
      this.handleDBExceptions(error);
    }
  }

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        DBExceptions                                            */
  //* ---------------------------------------------------------------------------------------------- */

  private handleDBExceptions(error: any) {
    if (error.code === '23503') throw new ConflictException(error.detail); //! key not exist

    throw new InternalServerErrorException(
      'Unexpected Error, check server Logs:' + error.message,
    );
  }
}
