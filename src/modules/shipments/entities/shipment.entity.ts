import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Order } from 'src/modules/orders/entities/order.entity';
import { Place } from 'src/modules/places/entities/place.entity';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string; //! string

  @Column('boolean', { default: true }) //! default: true
  enabled: boolean;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @OneToMany(() => Order, (order) => order.shipment)
  orders: Order[];

  @ManyToOne(() => Place, (place) => place.shipments, {
    onDelete: 'CASCADE',
  })
  place: Place;
}
