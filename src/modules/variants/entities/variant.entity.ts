import { Multimedia } from 'src/modules/multimedia/entities/multimedia.entity';
import { Color } from 'src/modules/catalogs/colors/entities/color.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { Size } from 'src/modules/catalogs/sizes/entities/size.entity';
import { Outfit } from 'src/modules/outfits/entities/outfit.entity';
import { Item } from 'src/modules/orders/entities/Item.entity';
//? ---------------------------------------------------------------------------------------------- */
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Unique(['product', 'color', 'size'])
@Entity('variants')
export class Variant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true }) //! NULL
  code: string;

  @Column('integer', { default: 0 }) //! default 0
  stock: number;

  @Column({ type: 'boolean', default: false }) //! default false
  available: boolean;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  // Relacion con la tabla de product ( muchos variants pueden pertenecer a un product )
  @ManyToOne(() => Product, (product) => product.variants)
  product: Product;

  // Relacion con la tabla de color ( muchos variants pueden pertenecer a un color )
  @ManyToOne(() => Color, (color) => color.variants)
  color: Color;

  // Relacion con la tabla de size ( muchos variants pueden pertenecer a un size )
  @ManyToOne(() => Size, (size) => size.variants)
  size: Size;

  // Relacion con la tabla de multimedia ( un variant puede tener muchos multimedia )
  @OneToMany(() => Multimedia, (multimedia) => multimedia.variant, {
    cascade: true, //! creacion en cascada
    eager: true,
  })
  multimedia: Multimedia[];

  // Relacion con la tabla de Item ( un variant puede estar en muchos items )
  @OneToMany(() => Item, (item) => item.variant)
  items: Item[];

  // Relacion con la tabla de Outfit ( un variant puede estar en muchos outfits )
  @ManyToMany(() => Outfit, (outfit) => outfit.variants)
  outfits: Outfit[];

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Functions                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @BeforeUpdate()
  @BeforeInsert()
  availableFunction() {
    if (this.stock === 0) {
      this.available = false;
    } else {
      this.available = true;
    }
  }
}
