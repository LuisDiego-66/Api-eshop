import {
  Entity,
  Column,
  OneToOne,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { SiatLista } from './lista.entity';
import { SiatParametrica } from './parametrica.entity';
import { Cuis } from 'src/siat/codigos/entities/cuis.entity';
import { Factura } from 'src/siat/facturas/entities/factura.entity';

@Entity('siat_sync')
export class SiatSync {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  codigoAmbiente: number;

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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  //* ============================================================================================== */
  //*                                        Relations                                               */
  //* ============================================================================================== */

  @ManyToOne(() => Cuis, (cuis) => cuis.siatSyncs)
  cuis: Cuis;

  @OneToMany(() => SiatLista, (lista) => lista.siatsync, {
    cascade: true,
  })
  listas: SiatLista[];

  @OneToMany(() => SiatParametrica, (parametrica) => parametrica.siatsync, {
    cascade: true,
  })
  parametrica: SiatParametrica[];

  /* @OneToOne(() => Factura, (factura) => factura.siatSync)
  factura: Factura; */

  @OneToMany(() => Factura, (factura) => factura.siatSync)
  facturas: Factura[];
}
