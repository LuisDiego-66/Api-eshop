import { Address } from 'src/modules/addresses/entities/address.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('text')
  name: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text')
  phone: string;

  @Column('boolean', { nullable: true })
  enabled: boolean;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  // Relacion con la tabla de multimedia ( un product puede tener muchos multimedia )
  @OneToMany(() => Order, (order) => order.customer)
  order: Order[];

  // Relacion con la tabla de address ( un customer puede tener muchas addresses )
  @OneToMany(() => Address, (address) => address.customer)
  address: Address[];
}
