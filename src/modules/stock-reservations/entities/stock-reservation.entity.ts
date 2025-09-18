import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
    const minutes = 10;
    const now = new Date();
    const end = new Date(now);
    end.setMinutes(end.getMinutes() + minutes);
    this.expiresAt = end;
  }
}
