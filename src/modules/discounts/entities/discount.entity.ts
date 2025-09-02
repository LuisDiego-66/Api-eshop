import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DiscountType } from '../enums/discount-type.enum';

import { Product } from 'src/modules/products/entities/product.entity';

@Entity('discounts')
export class Discount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: DiscountType,
  })
  discountType: DiscountType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date | null;

  @Column({ type: 'int' })
  value: number;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @DeleteDateColumn({ select: false, nullable: true })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  // Relacion con la tabla de products ( un discounts pueden pertenecer a muchos products)
  @OneToMany(() => Product, (product) => product.discount)
  products: Product[];

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Functions                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @BeforeInsert()
  @BeforeUpdate()
  cleanDiscountValuesInsert() {
    if (this.discountType === DiscountType.PERMANENT) {
      this.startDate = null;
      this.endDate = null;
    }
  }
}
