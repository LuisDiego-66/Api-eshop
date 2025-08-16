import { Customer } from 'src/modules/customers/entities/customer.entity';
import { Shipment } from 'src/modules/shipments/entities/shipment.entity';
import { Address } from 'src/modules/addresses/entities/address.entity';
import { Item } from './Item.entity';
//? ---------------------------------------------------------------------------------------------- */
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
//? ---------------------------------------------------------------------------------------------- */
import { OrderType } from '../enums/order-type.enum';
import { OrderStatus } from '../enums/order-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: OrderType })
  type: OrderType;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.IN_PROGRESS }) //! default: 'inprogress'
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

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  // Relacion con la tabla de orderItem ( una order puede tener muchos items )
  @OneToMany(() => Item, (item) => item.order, { cascade: true })
  items: Item[];

  // Relacion con la tabla de product ( muchos items pueden pertenecer a un product)
  @ManyToOne(() => Customer, (customer) => customer.order, { nullable: true }) //! NULL
  customer?: Customer | null;

  // Relacion con la tabla shipment ( una order puede tener un shipment )
  @ManyToOne(() => Shipment, (shipment) => shipment.orders, { nullable: true }) //! NULL
  shipment?: Shipment | null;

  // Relacion con la tabla address ( muchas orders pueden tener una address )
  @ManyToOne(() => Address, (address) => address.orders, { nullable: true }) //! NULL
  address?: Address | null;

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
}
