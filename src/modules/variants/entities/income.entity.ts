import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Variant } from './variant.entity';

@Entity('incomes')
export class Income {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer', { default: 0 }) //! default 0
  quantity: number;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  // Relacion con la tabla de color ( muchos variants pueden pertenecer a un color )
  @ManyToOne(() => Variant, (variant) => variant.incomes)
  variant: Variant;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Functions                                               */
  //* ---------------------------------------------------------------------------------------------- */
}
