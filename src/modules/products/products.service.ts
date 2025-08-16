import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
//? ---------------------------------------------------------------------------------------------- */
import { Product } from './entities/product.entity';
//? ---------------------------------------------------------------------------------------------- */
import { PaginationDto } from 'src/common/dtos/pagination';
import { CreateProductDto, UpdateProductDto } from './dto';

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
        discount: { id: createProductDto.discount },
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
      relations: { brand: true, discount: true, variants: true },
    });

    return products;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindOne                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { variants: true },
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

    throw new InternalServerErrorException(error.message);
  }
}
