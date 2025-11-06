import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Variant } from './variant.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer', { default: 0 }) //! default 0
  quantity: number;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ManyToOne(() => Variant, (variant) => variant.transactions)
  variant: Variant;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Functions                                               */
  //* ---------------------------------------------------------------------------------------------- */
}
