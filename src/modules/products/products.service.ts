import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  In,
  IsNull,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

import { handleDBExceptions } from 'src/common/helpers/handleDBExceptions';

import { paginateAdvanced } from 'src/common/pagination/paginate-advanced';
import { paginate } from 'src/common/pagination/paginate';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import {
  ProductPaginationDto,
  DiscountFilter,
} from './pagination/product-pagination.dto';

import {
  AddDiscountsAllDto,
  AddDiscountsDto,
  CreateProductDto,
  UpdateProductDto,
} from './dto';

import { GenderType } from '../categories/enums/gender-type.enum';

import { SearchsService } from './searchs.service';
import { VariantsService } from '../variants/variants.service';

import { Product } from './entities/product.entity';
import { Discount } from '../discounts/entities/discount.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly searchsService: SearchsService,

    private readonly variantsService: VariantsService,

    private dataSource: DataSource,
  ) {}

  //? ============================================================================================== */
  //?                                        Create                                                  */
  //? ============================================================================================== */

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

  //? ============================================================================================== */
  //?                                        FindAll                                                 */
  //? ============================================================================================== */

  /*   async findAll(pagination: ProductPaginationDto) {
    const { days, discounts } = pagination;

    const where: any = {};

    // --------------------------------------------
    // 1. Busqueda por Dias
    // --------------------------------------------
    if (days) {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);

      where.createdAt = MoreThanOrEqual(dateFrom);
    }

    // --------------------------------------------
    // 1. Busqueda descuentos (true-false)
    // --------------------------------------------

    if (discounts !== undefined) {
      if (discounts === DiscountFilter.true) {
        where.discount = Not(IsNull());
      } else {
        where.discount = IsNull();
      }
    }

    return paginate(
      this.productRepository,

      {
        where,

        relations: {
          subcategory: { category: true },
          discount: true,
          productColors: true,
        },
      },

      pagination,
      ['name'], //* busqueda por:
    );
  } */
  async findAll(pagination: ProductPaginationDto) {
    const { days, discounts } = pagination;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .leftJoinAndSelect('subcategory.category', 'category')
      .leftJoinAndSelect(
        'product.discount',
        'discount',
        'discount.deletedAt IS NULL',
      )
      .leftJoinAndSelect('product.productColors', 'productColors');

    // --------------------------------------------
    // 1. Búsqueda por días
    // --------------------------------------------
    if (days) {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);

      qb.andWhere('product.createdAt >= :dateFrom', { dateFrom });
    }

    // --------------------------------------------
    // 2. Filtro descuentos (true / false)
    // --------------------------------------------
    if (discounts !== undefined) {
      if (discounts === DiscountFilter.true) {
        qb.andWhere('discount.id IS NOT NULL');
      } else {
        qb.andWhere('discount.id IS NULL');
      }
    }

    // --------------------------------------------
    // 3. Paginación
    // --------------------------------------------
    return paginate(
      this.productRepository,

      {
        //where,

        relations: {
          subcategory: { category: true },
          discount: true,
          productColors: true,
        },
      },

      pagination,
      ['name'], //* busqueda por:
    );
  }

  //? ============================================================================================== */
  //?                    FindAll_with_search_advance                                                 */
  //? ============================================================================================== */

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

  //? ============================================================================================== */

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

  //? ============================================================================================== */
  //?                       FindOne_Product_Variants                                                 */
  //? ============================================================================================== */

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

  //? ============================================================================================== */
  //?                                        FindOne                                                 */
  //? ============================================================================================== */

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

  //? ============================================================================================== */

  async findOneWithStock(id: number) {
    let product = await this.productRepository.findOne({
      where: { id },
      relations: {
        productColors: { variants: { size: true }, color: true },
        subcategory: { category: true },
        discount: true,
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

    // --------------------------------------------
    // 2. Eliminar descuento si ha caducado
    // --------------------------------------------

    product = this.removeExpiredDicounts(product);

    return product;
  }

  //? ============================================================================================== */
  //?                                        Update                                                  */
  //? ============================================================================================== */

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    try {
      Object.assign(product, updateProductDto);
      return await this.productRepository.save(product);
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  //? ============================================================================================== */
  //?                                  AddDiscounts                                                  */
  //? ============================================================================================== */

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

  //? ============================================================================================== */
  //?                                  AddDiscounts                                                  */
  //? ============================================================================================== */

  async addDiscountsAll(addDiscountsAllDto: AddDiscountsAllDto) {
    const { discountId } = addDiscountsAllDto;

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

      const products = await queryRunner.manager.find(Product);

      // --------------------------------------------
      // 3. Actualización masiva con un solo UPDATE
      // --------------------------------------------

      await queryRunner.manager
        .createQueryBuilder()
        .update(Product)
        .set({ discount: discountEntity })
        .execute();

      await queryRunner.commitTransaction();

      return {
        message: 'Discount applied successfully to products',
        count: products.length,
        //products: products.map((p) => ({ id: p.id, name: p.name })),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  //? ============================================================================================== */
  //?                                        Delete                                                  */
  //? ============================================================================================== */

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

  //* ============================================================================================== */
  //*                                     Functions                                                  */
  //* ============================================================================================== */

  removeExpiredDicounts(product: Product): Product {
    // --------------------------------------------
    // 1. Se elimina el descuento si ha caducado
    // --------------------------------------------

    if (product.discount && product.discount.endDate) {
      const currentDate = new Date();
      const discountEndDate = new Date(product.discount.endDate);

      if (currentDate > discountEndDate) {
        product.discount = null;
      }
    }

    return product;
  }
}
