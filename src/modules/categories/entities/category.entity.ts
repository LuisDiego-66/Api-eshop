import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { GenderType } from '../enums/gender-type.enum';

import { Subcategory } from 'src/modules/subcategories/entities/subcategory.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column({ type: 'enum', enum: GenderType })
  gender: GenderType;

  @Column('integer', { default: 0 })
  displayOrder: number;

  @Column('boolean', { default: true })
  enabled: boolean;

  @Column('text', { nullable: true })
  image: string;

  //@CreateDateColumn(/* { select: false } */)
  //createdAt: Date;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @DeleteDateColumn({ select: false, nullable: true })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @OneToMany(() => Subcategory, (subcategory) => subcategory.category, {
    //cascade: true, //! para la eliminacion en cascada de subcategories
  })
  subcategories: Subcategory[];
}

// 2025-12-11 14:42:37.051
// 2025-12-11 10:42:37.051
