import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ProductColor } from 'src/modules/variants/entities/product-color.entity';

@Entity('outfits')
export class Outfit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ManyToMany(() => ProductColor, (productColor) => productColor.outfits, {
    /*  cascade: true, */
  })
  @JoinTable({
    name: 'outfit_productColors', // nombre de la tabla intermedia
    joinColumn: {
      name: 'outfitId', // columna FK hacia Outfit
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'productColorId', // columna FK hacia Variant
      referencedColumnName: 'id',
    },
  })
  productColors: ProductColor[];
}
