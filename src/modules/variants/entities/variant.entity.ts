import {
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
import { Outfit } from 'src/modules/outfits/entities/outfit.entity';
import { Item } from 'src/modules/orders/entities/item.entity';
import { Size } from 'src/modules/sizes/entities/size.entity';
import { ProductColor } from './product-color.entity';
import { Transaction } from './transaction.entity';

@Unique(['productColor', 'size'])
@Entity('variants')
export class Variant {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ManyToOne(() => Size, (size) => size.variants)
  size: Size;

  @OneToMany(() => Item, (item) => item.variant)
  items: Item[];

  @ManyToMany(() => Outfit, (outfit) => outfit.variants)
  outfits: Outfit[];

  @OneToMany(() => StockReservation, (reservation) => reservation.variant)
  stock_reservations: StockReservation[];

  @ManyToOne(() => ProductColor, (productColor) => productColor.variants, {
    nullable: false,
  })
  productColor: ProductColor;

  @OneToMany(() => Transaction, (transaction) => transaction.variant, {
    cascade: true,
  })
  transactions: Transaction[];

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Functions                                               */
  //* ---------------------------------------------------------------------------------------------- */
}
