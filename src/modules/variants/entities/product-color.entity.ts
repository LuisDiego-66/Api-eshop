import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Product } from 'src/modules/products/entities/product.entity';
import { Variant } from 'src/modules/variants/entities/variant.entity';
import { Color } from 'src/modules/colors/entities/color.entity';

@Unique(['product', 'color'])
@Entity('product_colors')
export class ProductColor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { array: true, default: [] })
  multimedia?: string[];

  @Column('text', { array: true, default: [] })
  pdfs?: string[];

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ManyToOne(() => Color, (color) => color.productColors)
  color: Color;

  @ManyToOne(() => Product, (product) => product.productColors)
  product: Product;

  @OneToMany(() => Variant, (variant) => variant.productColor, {
    cascade: true,
  })
  variants: Variant[];

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Functions                                               */
  //* ---------------------------------------------------------------------------------------------- */
}
