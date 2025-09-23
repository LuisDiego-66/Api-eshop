import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PaymentMethod } from '../enums/payment-method.enum';

import { Order } from 'src/modules/orders/entities/order.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true }) //! NULL
  qrId: string;

  @Column('text', { nullable: true }) //! NULL
  sourceBankId: string;

  @Column('text', { nullable: true }) //! NULL
  saver: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: string;

  @Column('text')
  gloss: string;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn()
  order: Order;
}
