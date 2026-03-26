import { Order } from 'src/modules/orders/entities/order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('billings')
export class Billing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', unique: true })
  ci: string;

  @Column({ type: 'text', nullable: true })
  name?: string;

  @Column({ type: 'text', nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  complemento?: string;

  @Column({ type: 'int' })
  codigoTipoDocumentoIdentidad?: number;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @OneToMany(() => Order, (order) => order.billing)
  orders: Order[];
}
