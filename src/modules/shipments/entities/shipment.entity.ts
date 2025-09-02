import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';

import { ShipmentMethod } from '../enums/shipment-method.enum';

import { Order } from 'src/modules/orders/entities/order.entity';

@Entity('shipments')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Shipment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ShipmentMethod })
  method: ShipmentMethod;

  @Column('boolean', { default: true }) //! default: true
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

  // Relacion con la tabla de order ( una shipment puede pertenecer a muchos orders )
  @OneToMany(() => Order, (order) => order.shipment /* { cascade: true } */)
  orders: Order[];
}
