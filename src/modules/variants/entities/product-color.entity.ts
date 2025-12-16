import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Product } from 'src/modules/products/entities/product.entity';
import { Variant } from 'src/modules/variants/entities/variant.entity';
import { Outfit } from 'src/modules/outfits/entities/outfit.entity';
import { Color } from 'src/modules/colors/entities/color.entity';

@Unique(['product', 'color'])
@Entity('product_colors')
export class ProductColor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { array: true, default: [] })
  multimedia: string[];

  @Column('text', { array: true, default: [] })
  pdfs: string[];

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ManyToOne(() => Color, (color) => color.productColors, {
    nullable: false,
    eager: true,
  })
  color: Color;

  @ManyToOne(() => Product, (product) => product.productColors, {
    nullable: false,
  })
  product: Product;

  @OneToMany(() => Variant, (variant) => variant.productColor, {
    cascade: true,
  })
  variants: Variant[];

  @ManyToMany(() => Outfit, (outfit) => outfit.productColors)
  outfits: Outfit[];

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Functions                                               */
  //* ---------------------------------------------------------------------------------------------- */
}
