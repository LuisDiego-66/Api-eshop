import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Factura } from './factura.entity';

@Entity('cafc')
export class Cafc {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  codigo: string;

  @Column({
    type: 'bigint',
  })
  numeroInicial: number;

  @Column({
    type: 'bigint',
  })
  numeroFinal: number;

  @Column({ type: 'bigint', nullable: true })
  ultimoNumero: number | null;

  //* ============================================================================================== */
  //*                                        Relations                                               */
  //* ============================================================================================== */

  @OneToMany(() => Factura, (factura) => factura.cafc)
  facturas: Factura[];

  @CreateDateColumn()
  createdAt: Date;
}
