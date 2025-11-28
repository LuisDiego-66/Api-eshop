import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

import { GenderType } from 'src/modules/categories/enums/gender-type.enum';

@Entity('searchs')
export class Search {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { unique: true })
  name: string;

  @Column({ type: 'int', default: 1 })
  count: number;

  @Column({ type: 'text', nullable: true }) //! nullable
  gender: GenderType | null;

  @CreateDateColumn({ select: false })
  createdAt: Date;
}
