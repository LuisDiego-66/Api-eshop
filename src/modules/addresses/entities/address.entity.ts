import { Customer } from 'src/modules/customers/entities/customer.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
//? ---------------------------------------------------------------------------------------------- */
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

  // Relacion con la tabla de customer ( muchas address pertenecen a un customer )
  @ManyToOne(() => Customer, (customer) => customer.address)
  customer: Customer;

  // Relacion con la tabla de order ( una address puede pertenecer a muchas orders )
  @OneToMany(() => Order, (order) => order.address)
  orders: Order[];
}
