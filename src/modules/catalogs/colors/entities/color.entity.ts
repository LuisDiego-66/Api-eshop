import { Variant } from 'src/modules/variants/entities/variant.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('colors')
export class Color {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text')
  code: string;

  @Column('boolean', { default: true })
  enabled: boolean;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  // Relacion con la tabla de variants ( un color puede estar en muchos variants )
  @OneToMany(() => Variant, (variant) => variant.color)
  variants: Variant[];
}
