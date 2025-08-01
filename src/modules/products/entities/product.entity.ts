import { Brand } from 'src/modules/catalogs/brands/entities/brand.entity';
import { Discount } from 'src/modules/discounts/entities/discount.entity';
import { Variant } from 'src/modules/variants/entities/variant.entity';
import { Subcategory } from 'src/modules/subcategories/entities/subcategory.entity';
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

  // Relacion con la tabla de subcategories ( muchos products pueden pertenecer a una subcategory)
  @ManyToOne(() => Subcategory, (subcategory) => subcategory.products)
  subcategory: Subcategory;

  // Relacion con la tabla de products_varians ( un product puede tener muchos products_varians )
  @OneToMany(() => Variant, (variant) => variant.product)
  variants: Variant[];

  // Relacion con la tabla de brands ( muchos products pueden pertenecer a una brand)
  @ManyToOne(() => Brand, (brand) => brand.products, { nullable: true }) //! nulable
  brand?: Brand;

  // Relacion con la tabla de discounts ( muchos products pueden tener un discounts )
  @ManyToOne(() => Discount, (discount) => discount.products, {
    nullable: true, //! nulable
  })
  discounts?: Discount;
}
