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

import { Customer } from 'src/modules/customers/entities/customer.entity';
import { Order } from 'src/modules/orders/entities/order.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text')
  address: string;

  @Column('text')
  city: string;

  @CreateDateColumn({ select: false })
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
}
