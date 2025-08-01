import { Color } from 'src/modules/catalogs/colors/entities/color.entity';
import { Multimedia } from 'src/modules/multimedia/entities/multimedia.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { Size } from 'src/modules/catalogs/sizes/entities/size.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Item } from 'src/modules/orders/entities/Item.entity';

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

  @Column('integer', { default: 0 })
  stock: number;

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
  @OneToMany(() => Multimedia, (multimedia) => multimedia.variant)
  multimedia: Multimedia[];

  // Relacion con la tabla de Item ( un variant puede estar en muchos items )
  @OneToMany(() => Item, (item) => item.variant)
  items: Item[];
}
