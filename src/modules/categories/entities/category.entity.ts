import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @Column('integer')
  displayOrder: number;

  @Column('boolean', { default: true })
  enabled: boolean;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @DeleteDateColumn({ select: false, nullable: true })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  // Relacion con la tabla de subcategories ( una category puede tener muchas subcategories )
  @OneToMany(() => Subcategory, (subcategory) => subcategory.category, {
    //cascade: true, //! para la eliminacion en cascada de subcategories
  })
  subcategories: Subcategory[];
}
