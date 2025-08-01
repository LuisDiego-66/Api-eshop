import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from './Item.entity';
import { Customer } from 'src/modules/customers/entities/customer.entity';
import { Shipment } from 'src/modules/shipments/entities/shipment.entity';
import { Address } from 'src/modules/addresses/entities/address.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('text')
  type: string; // enum  // shipping, pickup

  @Column('boolean', { default: true })
  status: boolean; // enum

  @Column('boolean', { default: true })
  enabled: boolean; // enum

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: string;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  // Relacion con la tabla de orderItem ( una order puede tener muchos items )
  @OneToMany(() => Item, (item) => item.order)
  item: Item[];

  // Relacion con la tabla de product ( muchos items pueden pertenecer a un product)
  @ManyToOne(() => Customer, (customer) => customer.order)
  customer: Customer;

  // Relacion con la tabla shipment ( una order puede tener un shipment )
  @ManyToOne(() => Shipment, { nullable: true })
  shipment: Shipment;

  // Relacion con la tabla address ( muchas orders pueden tener una address )
  @ManyToOne(() => Address, (address) => address.orders)
  address: Address;
}
