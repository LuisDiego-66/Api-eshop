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
import { DiscountMethod } from '../enums/discount-method.enum';

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

  @Column({
    type: 'enum',
    enum: DiscountMethod,
  })
  discountMethod: DiscountMethod;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage?: number | null; // ej: 15.00 para 15%

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fixedAmount?: number | null; // ej: 20.00 para 20 Bs.

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
  @OneToMany(() => Product, (product) => product.discounts)
  products: Product[];

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Functions                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @BeforeInsert()
  @BeforeUpdate()
  cleanDiscountValuesInsert() {
    if (this.discountMethod === DiscountMethod.PERCENTAGE) {
      this.fixedAmount = null;
    } else if (this.discountMethod === DiscountMethod.FIXED) {
      this.percentage = null;
    }

    if (this.discountType === DiscountType.PERMANENT) {
      this.startDate = null;
      this.endDate = null;
    }
  }
}
