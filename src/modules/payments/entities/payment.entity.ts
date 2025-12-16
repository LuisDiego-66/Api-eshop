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

  @Column('text')
  qrId: string;

  @Column('text')
  sourceBankId: string;

  //@Column('text')
  //saver: string;

  @Column({ type: 'text', default: PaymentMethod.QR_CODE })
  method: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: string;

  @Column('text')
  gloss: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @OneToOne(() => Order, (order) => order.payment)
  @JoinColumn()
  order: Order;
}
