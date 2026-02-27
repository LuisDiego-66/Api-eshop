import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Subcategory } from 'src/modules/subcategories/entities/subcategory.entity';
import { ProductColor } from '../../variants/entities/product-color.entity';
import { Discount } from 'src/modules/discounts/entities/discount.entity';
import { Brand } from 'src/modules/brands/entities/brand.entity';

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

  @Column('text', { nullable: true })
  video: string;

  @Column('boolean', { default: true })
  enabled: boolean;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

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
  brand?: Brand | null;

  @ManyToOne(() => Discount, (discount) => discount.products, {
    nullable: true, //! NULL
  })
  discount?: Discount | null;
}
