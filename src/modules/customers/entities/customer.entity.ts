import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AuthProviders } from 'src/auth/enums/providers.enum';
import { CustomerType } from '../enums/customer-type.enum';

import { Address } from 'src/modules/addresses/entities/address.entity';
import { Order } from 'src/modules/orders/entities/order.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true }) //! null
  name?: string;

  @Column('text', { unique: true }) //! Unique
  email: string;

  @Column('text', { nullable: true }) //! null
  phone?: string;

  @Column({
    type: 'enum',
    enum: CustomerType,
    default: CustomerType.REGISTERED,
  })
  type: CustomerType;

  @Column({ type: 'enum', enum: AuthProviders, nullable: true }) //! null
  provider?: AuthProviders;

  @Column('text', { nullable: true }) //! null
  idProvider?: string;

  @Column('boolean', { default: true }) //! default true
  enabled: boolean;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @OneToMany(() => Order, (order) => order.customer)
  order: Order[];

  @OneToMany(() => Address, (address) => address.customer)
  address: Address[];
}
