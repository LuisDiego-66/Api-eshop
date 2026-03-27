import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Cufd } from './cufd.entity';
import { SiatSync } from 'src/siat/catalogos/entities/siat_sync.entity';

@Entity('cuis')
export class Cuis {
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

  @Column({ type: 'bigint' })
  nit: number;

  //* ============================================================================================== */

  @Column('text')
  codigo: string;

  @Column({ type: 'timestamptz' })
  fechaVigencia: Date;

  @Column('boolean')
  transaccion: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  //* ============================================================================================== */
  //*                                        Relations                                               */
  //* ============================================================================================== */

  @OneToMany(() => SiatSync, (siatSync) => siatSync.cuis)
  siatSyncs: SiatSync[];

  @OneToMany(() => Cufd, (cufd) => cufd.cuis)
  cufd: Cufd[];
}
