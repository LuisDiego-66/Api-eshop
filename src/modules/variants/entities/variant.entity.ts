import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { StockReservation } from '../../stock-reservations/entities/stock-reservation.entity';
import { Item } from 'src/modules/orders/entities/item.entity';
import { Size } from 'src/modules/sizes/entities/size.entity';
import { ProductColor } from './product-color.entity';
import { Transaction } from './transaction.entity';

@Unique(['productColor', 'size'])
@Entity('variants')
export class Variant {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt?: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ManyToOne(() => Size, (size) => size.variants, { eager: true })
  size: Size;

  @OneToMany(() => Item, (item) => item.variant)
  items: Item[];

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
