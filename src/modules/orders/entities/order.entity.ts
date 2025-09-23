import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrderType } from '../enums/order-type.enum';
import { OrderStatus } from '../enums/order-status.enum';

import { StockReservation } from 'src/modules/stock-reservations/entities/stock-reservation.entity';
import { Customer } from 'src/modules/customers/entities/customer.entity';
import { Shipment } from 'src/modules/shipments/entities/shipment.entity';
import { Address } from 'src/modules/addresses/entities/address.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { Item } from './item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: OrderType })
  type: OrderType;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING }) //! default
  status: OrderStatus;

  @Column('boolean', { default: true })
  enabled: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: string;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt?: Date;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @OneToMany(() => Item, (item) => item.order, { cascade: true })
  items: Item[];

  @ManyToOne(() => Customer, (customer) => customer.order, { nullable: true }) //! NULL
  customer?: Customer | null;

  @ManyToOne(() => Shipment, (shipment) => shipment.orders, { nullable: true }) //! NULL
  shipment?: Shipment | null;

  @ManyToOne(() => Address, (address) => address.orders, { nullable: true }) //! NULL
  address?: Address | null;

  @OneToMany(() => StockReservation, (reservation) => reservation.order)
  stock_reservations: StockReservation[];

  @OneToOne(() => Payment, (payment) => payment.order, { cascade: true })
  payment: Payment;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Functions                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @BeforeUpdate()
  @BeforeInsert()
  verify() {
    if (this.type === OrderType.IN_STORE) {
      this.shipment = null;
      this.address = null;
      this.customer = null;
    }
  }

  @BeforeInsert()
  setReservationDates() {
    const minutes = 10;
    const now = new Date();
    const end = new Date(now);
    end.setMinutes(end.getMinutes() + minutes);
    this.expiresAt = end;
  }
}
