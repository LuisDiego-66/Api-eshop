import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('advertisements')
export class Advertisement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  text: string;

  @Column('boolean', { default: true })
  enabled: boolean;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;
}
