import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Cuis } from './cuis.entity';

@Entity('cufd')
export class Cufd {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  codigoAmbiente: number;

  @Column({ type: 'int' })
  codigoModalidad: number;

  @Column({ type: 'int' })
  codigoPuntoVenta: number;

  @Column({ type: 'text' })
  codigoSistema: string;

  @Column({ type: 'int' })
  codigoSucursal: number;

  @Column({ type: 'text' })
  codigoCuis: string;

  @Column({ type: 'bigint' })
  nit: number;

  //* ============================================================================================== */

  @Column('text')
  codigo: string;

  @Column('text')
  codigoControl: string;

  @Column('text')
  direccion: string;

  @Column({ type: 'timestamptz' })
  fechaVigencia: Date;

  @Column('boolean')
  transaccion: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  //* ============================================================================================== */
  //*                                        Relations                                               */
  //* ============================================================================================== */

  @ManyToOne(() => Cuis, (cuis) => cuis.cufd)
  cuis: Cuis;
}
