import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Subcategory } from 'src/modules/subcategories/entities/subcategory.entity';
import { Discount } from 'src/modules/discounts/entities/discount.entity';
import { Brand } from 'src/modules/brands/entities/brand.entity';
import { ProductColor } from '../../variants/entities/product-color.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string; //! string

  @Column('boolean', { default: true })
  enabled: boolean;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ManyToOne(() => Subcategory, (subcategory) => subcategory.products)
  subcategory: Subcategory;

  @OneToMany(() => ProductColor, (productColors) => productColors.product, {
    cascade: true,
  })
  productColors: ProductColor[];

  @ManyToOne(() => Brand, (brand) => brand.products, { nullable: true }) //! NULL
  brand?: Brand;

  @ManyToOne(() => Discount, (discount) => discount.products, {
    nullable: true, //! NULL
  })
  discount?: Discount;
}
