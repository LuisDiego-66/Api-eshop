import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('daily_cash')
export class DailyCash {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;
}
