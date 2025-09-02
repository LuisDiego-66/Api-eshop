import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AuthProviders } from 'src/auth/enums/providers.enum';

import { Address } from 'src/modules/addresses/entities/address.entity';
import { Order } from 'src/modules/orders/entities/order.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text', { unique: true }) //! Unique
  email: string;

  @Column('text', { nullable: true }) //! null
  phone?: string;

  @Column({ type: 'enum', enum: AuthProviders })
  provider: AuthProviders;

  @Column('text')
  idProvider: string;

  @Column('boolean', { default: true }) //! default true
  enabled: boolean;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt?: Date;

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
