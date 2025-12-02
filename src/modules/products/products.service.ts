import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  In,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { paginateAdvanced } from 'src/common/pagination/paginate-advanced';
import { ProductPaginationDto } from './pagination/product-pagination.dto';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { paginate } from 'src/common/pagination/paginate';

import { AddDiscountsDto, CreateProductDto, UpdateProductDto } from './dto';

import { GenderType } from '../categories/enums/gender-type.enum';

import { VariantsService } from '../variants/variants.service';
import { SearchsService } from './searchs.service';

import { Discount } from '../discounts/entities/discount.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly searchsService: SearchsService,

    private readonly variantsService: VariantsService,

    private dataSource: DataSource,
  ) {}

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        Create                                                  */
  //? ---------------------------------------------------------------------------------------------- */

  async create(createProductDto: CreateProductDto) {
    try {
      const newProduct = this.productRepository.create({
        ...createProductDto,
        subcategory: { id: createProductDto.subcategory },
        brand: createProductDto.brand ? { id: createProductDto.brand } : null,
        discount: createProductDto.discount
          ? { id: createProductDto.discount }
          : null,
      });
      return await this.productRepository.save(newProduct);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                                        FindAll                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAll(pagination: ProductPaginationDto) {
    const { days } = pagination;

    const options = {
      where: {},
    };

    if (days) {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);

      options.where = {
        createdAt: MoreThanOrEqual(dateFrom),
        deletedAt: null, //* se excluyen eliminados
      };
    }

    return paginate(
      this.productRepository,

      {
        ...options,

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
  //?                    FindAll_with_search_advance                                                 */
  //? ---------------------------------------------------------------------------------------------- */

  async findAllForCategoriesAndSubCategories(pagination: PaginationDto) {
    // --------------------------------------------
    // 1. Busqueda (por relaciones)
    // --------------------------------------------

    const products = await paginateAdvanced(
      this.productRepository,
      pagination,

      //* ------- SEARCHS -------

      ['name', 'subcategory.name', 'subcategory.category.name'],

      //* ------- RELATIONS -------

      [
        'subcategory',
        'subcategory.category',
        'discount',
        'productColors',
        'productColors.color',
      ],
      { id: 'DESC' },
    );

    // --------------------------------------------
    // 2. Se Almacena el nombre + gender
    // --------------------------------------------

    await this.createSearch(products);

    return products;
  }

  //? ---------------------------------------------------------------------------------------------- */
  //? ---------------------------------------------------------------------------------------------- */

  async createSearch(products: any) {
    const results = new Map<string, GenderType>();

    for (const product of products.data) {
      const sub = product.subcategory;
      const cat = product.subcategory?.category;
      const gender = cat?.gender ?? null;

      //* ------- SUBCATEGORÍA -------
      if (sub?.name) {
        const subName = sub.name.toLowerCase();
        results.set(subName, gender);
      }

      //* ------- CATEGORÍA -------
      if (cat?.name) {
        const catName = cat.name.toLowerCase();
        results.set(catName, gender);
      }
    }

    for (const [name, gender] of results) {
      await this.searchsService.create({ name, gender });
    }
  }

  //? ---------------------------------------------------------------------------------------------- */
  //?                       FindOne_Product_Variants                                                 */
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
  //? ---------------------------------------------------------------------------------------------- */

  async findOneWithStock(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        productColors: { variants: { size: true }, color: true },
        discount: true,
        subcategory: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // --------------------------------------------
    // 1. Agregar stock a las variantes
    // --------------------------------------------

    const productWithStock = await this.variantsService.addStockToProductColors(
      product.productColors,
    );

    product.productColors = productWithStock;

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
      // --------------------------------------------
      // 1. Verificar que el descuento exista
      // --------------------------------------------

      const discountEntity = await queryRunner.manager.findOne(Discount, {
        where: { id: discountId },
      });
      if (!discountEntity)
        throw new NotFoundException(`Discount with ID ${discountId} not found`);

      // --------------------------------------------
      // 2. Buscar los productos
      // --------------------------------------------

      const products = await queryRunner.manager.find(Product, {
        where: { id: In(productsIds) },
      });
      if (products.length === 0)
        throw new NotFoundException('No products found with given IDs');

      // --------------------------------------------
      // 3. Verificar que existan todos los IDs
      // --------------------------------------------

      const foundIds = products.map((p) => p.id);
      const missingIds = productsIds.filter((id) => !foundIds.includes(id));
      if (missingIds.length > 0)
        throw new NotFoundException(
          `Products not found: [${missingIds.join(', ')}]`,
        );

      // --------------------------------------------
      // 4. Actualización masiva con un solo UPDATE
      // --------------------------------------------

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
