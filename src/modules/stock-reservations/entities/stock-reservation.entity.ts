import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { envs } from 'src/config/environments/environments';

import { ReservationStatus } from '../enum/reservation-status.enum';

import { Variant } from '../../variants/entities/variant.entity';
import { Order } from 'src/modules/orders/entities/order.entity';

@Entity('stock_reservations')
export class StockReservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer')
  quantity: number;

  @Column({
    type: 'enum',
    enum: ReservationStatus, //! ['active', 'expired', 'confirmed'],
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ManyToOne(() => Variant, (variant) => variant.stock_reservations, {
    /* onDelete: 'CASCADE', */
  })
  variant: Variant;

  @ManyToOne(() => Order, (order) => order.stock_reservations, {
    /* onDelete: 'CASCADE', */
  })
  order: Order;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Functions                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @BeforeInsert()
  setReservationDates() {
    const minutes = /* envs.RESERVATION_EXPIRE_MINUTES || */ 10;
    const now = new Date();
    const expires = new Date(now.getTime() + minutes * 60 * 1000);
    this.expiresAt = expires;
  }
}
