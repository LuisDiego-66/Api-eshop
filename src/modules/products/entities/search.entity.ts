import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity('searchs')
export class Search {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { unique: true })
  name: string;

  @Column({ type: 'int', default: 1 })
  count: number;

  @CreateDateColumn({ select: false })
  createdAt: Date;
}
