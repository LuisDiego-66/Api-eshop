import {
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

import { StockReservation } from '../../stock-reservations/entities/stock-reservation.entity';
import { Color } from 'src/modules/catalogs/colors/entities/color.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { Size } from 'src/modules/catalogs/sizes/entities/size.entity';
import { Outfit } from 'src/modules/outfits/entities/outfit.entity';
import { Item } from 'src/modules/orders/entities/item.entity';
import { Income } from './income.entity';

@Unique(['product', 'color', 'size'])
@Entity('variants')
export class Variant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'boolean', default: true })
  available: boolean;

  @Column('text', { array: true, nullable: true }) //! NULL
  multimedia?: string[];

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

  // Relacion con la tabla de Item ( un variant puede estar en muchos items )
  @OneToMany(() => Item, (item) => item.variant)
  items: Item[];

  // Relacion con la tabla de Outfit ( un variant puede estar en muchos outfits )
  @ManyToMany(() => Outfit, (outfit) => outfit.variants)
  outfits: Outfit[];

  // Relacion con la tabla de StockReservation ( un variant puede tener muchas reservas de stock )
  @OneToMany(() => StockReservation, (reservation) => reservation.variant)
  stock_reservations: StockReservation[];

  // Relacion con la tabla de StockReservation ( un variant puede tener muchas reservas de stock )
  @OneToMany(() => Income, (incomes) => incomes.variant)
  incomes: Income[];

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Functions                                               */
  //* ---------------------------------------------------------------------------------------------- */
}
