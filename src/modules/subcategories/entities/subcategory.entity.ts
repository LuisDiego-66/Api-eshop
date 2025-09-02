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

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @DeleteDateColumn({ select: false, nullable: true })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  // Relacion con la tabla de categories ( muchas subcategories pueden pertenecer a una category)
  @ManyToOne(() => Category, (category) => category.subcategories, {
    nullable: false,
  })
  category: Category;

  // Relacion con la tabla de products ( una subcategory puede tener muchos products )
  @OneToMany(() => Product, (product) => product.subcategory)
  products: Product[];
}
