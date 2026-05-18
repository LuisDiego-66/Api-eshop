import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { CodigoEmisionEnum } from '../enums/codigo-emision.enum';
import { MensajesList } from '../interfaces/response-recepcion-factura.interface';

import { Factura } from './factura.entity';

export enum paqueteEstatus {
  PENDIENTE = 'PENDIENTE',
  ENVIADO = 'ENVIADO',
  VALIDADO = 'VALIDADO',
  OBSERVADO = 'OBSERVADO',
  RECHAZADO = 'RECHAZADO',
}

@Entity('Paquetes')
export class Paquete {
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

  @Column({ type: 'bigint' })
  nit: number;

  @Column({ type: 'int' })
  codigoDocumentoSector: number;

  @Column({ type: 'text' })
  codigoEmision: CodigoEmisionEnum;

  @Column({ type: 'int' })
  codigoModalidad: number;

  @Column({ type: 'text' })
  codigoCufd: string;

  @Column({ type: 'text' })
  codigoCuis: string;

  @Column({ type: 'int' })
  tipoFacturaDocumento: number;

  @Column({ type: 'text' })
  archivo: string;

  @Column({ type: 'text' })
  fechaEnvio: string;

  @Column({ type: 'text' })
  hashArchivo: string;

  @Column({ type: 'text', nullable: true })
  cafc?: string | null;

  @Column({ type: 'int' })
  cantidadFacturas: number;

  @Column({ type: 'int' })
  codigoEvento: number;

  //* ============================================================================================== */
  //*                                         Response                                               */
  //* ============================================================================================== */

  @Column({ type: 'text', nullable: true })
  codigoDescripcion: string;

  @Column({ type: 'int', nullable: true })
  codigoEstado: number;

  @Column({ type: 'text', nullable: true })
  codigoRecepcion?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  mensajesList?: MensajesList[] | null;

  @Column({ type: 'boolean', nullable: true })
  transaccion: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  fechaRespuesta: Date;

  //* ============================================================================================== */
  //*                                        Relations                                               */
  //* ============================================================================================== */

  @OneToMany(() => Factura, (factura) => factura.paquete)
  facturas: Factura[];
}
