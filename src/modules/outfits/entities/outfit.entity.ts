import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Variant } from 'src/modules/variants/entities/variant.entity';

@Entity('outfits')
export class Outfit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ManyToMany(() => Variant, (variant) => variant.outfits, {
    cascade: true, // opcional, para guardar relaciones automáticamente
  })
  @JoinTable({
    name: 'outfit_variants', // nombre de la tabla intermedia
    joinColumn: {
      name: 'outfit_id', // columna FK hacia Outfit
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'variant_id', // columna FK hacia Variant
      referencedColumnName: 'id',
    },
  })
  variants: Variant[];
}
