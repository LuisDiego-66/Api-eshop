import { Variant } from 'src/modules/variants/entities/variant.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('multimedia')
export class Multimedia {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('text')
  link: string;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  // Relacion con la tabla de productVariants ( muchos multimedia pueden pertenecer a un productVariant)
  @ManyToOne(() => Variant, (variant) => variant.multimedia)
  variant: Variant;
}
