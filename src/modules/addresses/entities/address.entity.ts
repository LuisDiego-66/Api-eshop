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

import { AddressType } from '../enums/address-type.enum';

import { Customer } from 'src/modules/customers/entities/customer.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import { Place } from 'src/modules/places/entities/place.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  address: string;

  @Column('text')
  city: string;

  @Column('text', { nullable: true })
  country?: string;

  @Column('text', { nullable: true })
  postal_code?: string;

  @Column({
    type: 'enum',
    enum: AddressType,
    default: AddressType.NATIONAL,
  })
  type: AddressType;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ManyToOne(() => Customer, (customer) => customer.address, {
    nullable: false,
  })
  customer: Customer;

  @OneToMany(() => Order, (order) => order.address)
  orders: Order[];

  @ManyToOne(() => Place, (place) => place.address, {
    //cascade: true,
    nullable: true, //! null cuando la direccion es extranjera
  })
  place?: Place;
}
