import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Category } from 'src/modules/categories/entities/category.entity';
import { Product } from 'src/modules/products/entities/product.entity';

@Entity('subcategories')
export class Subcategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('boolean', { default: true })
  enabled: boolean;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @DeleteDateColumn({ select: false, nullable: true })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ManyToOne(() => Category, (category) => category.subcategories, {
    nullable: false,
  })
  category: Category;

  @OneToMany(() => Product, (product) => product.subcategory)
  products: Product[];
}
