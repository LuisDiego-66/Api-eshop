import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { SiatSync } from './siat_sync.entity';

@Entity('siat_listas')
export class SiatLista {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  methodName: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ManyToOne(() => SiatSync, { onDelete: 'CASCADE' })
  siatsync: SiatSync;
}
