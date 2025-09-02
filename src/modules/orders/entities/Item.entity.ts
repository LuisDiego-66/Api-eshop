import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Variant } from 'src/modules/variants/entities/variant.entity';
import { Order } from './order.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer')
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: string;

  @Column({ type: 'int' })
  discountValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: string; // 	quantity * unit_price - discountValue

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  // Relacion con la tabla de Item ( muchos items pueden pertenecer a una order)
  @ManyToOne(() => Variant, (variant) => variant.items)
  variant: Variant;

  // Relacion con la tabla de order ( muchos items pueden pertenecer a una order)
  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Functions                                               */
  //* ---------------------------------------------------------------------------------------------- */
}
