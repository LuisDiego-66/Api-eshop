import {
  Index,
  Entity,
  Column,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CodigoEmisionEnum } from '../enums/codigo-emision.enum';
import { FacturaStatusEnum } from '../enums/factura-status.enum';

import { MensajesList } from '../interfaces/response-recepcion-factura.interface';

import { Detalle } from './detalle.entity';
import { Paquete } from './paquete.entity';
import { SiatSync } from 'src/siat/catalogos/entities/siat_sync.entity';

@Entity('facturas')
export class Factura {
  @PrimaryGeneratedColumn()
  id: number;

  //* ============================================================================================== */
  //* Información del Emisor

  @Column({ type: 'bigint' })
  nitEmisor: number;

  @Column({ type: 'text' })
  razonSocialEmisor: string;

  @Column({ type: 'text' })
  municipio: string;

  @Column({ type: 'text' })
  telefono: string;

  //* ============================================================================================== */
  //* Información de la Factura

  @Column({ type: 'int' })
  @Index()
  numeroFactura: number;

  @Column({ type: 'text', unique: true })
  cuf: string; //! generado

  @Column({ type: 'text' })
  cufd: string;

  @Column({ type: 'int' })
  codigoSucursal: number;

  @Column({ type: 'text' })
  direccion: string;

  @Column({ type: 'int' })
  codigoPuntoVenta: number;

  @Column({ type: 'int' })
  tipoFacturaDocumento: number; //! Catalogos

  @Column({ type: 'timestamp' })
  fechaEmision: Date;

  //* ============================================================================================== */
  //* Información del Cliente

  @Column({ type: 'text' })
  nombreRazonSocial: string;

  //? ========================================================== */
  @Column({ type: 'int' })
  codigoTipoDocumentoIdentidad: number; //! Catalogos
  //? ========================================================== */

  @Column({ type: 'text' })
  numeroDocumento: string;

  @Column({ type: 'text', nullable: true })
  complemento?: string | null;

  @Column({ type: 'text' })
  codigoCliente: string;

  @Column({ type: 'int' })
  codigoMetodoPago: number; //! Catalogos

  @Column({ type: 'bigint', nullable: true })
  numeroTarjeta?: number | null;

  //* ============================================================================================== */
  //* Montos

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  montoTotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  montoTotalSujetoIva: number;

  //* ============================================================================================== */
  //* Moneda

  @Column({ type: 'int' })
  codigoMoneda: number; //! Catalogos

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  tipoCambio: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  montoTotalMoneda: number;

  //* ============================================================================================== */
  //* Descuentos y adicionales

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  montoGiftCard?: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  descuentoAdicional?: number | null;

  @Column({ type: 'int', nullable: true })
  codigoExcepcion?: number | null;

  @Column({ type: 'bigint', nullable: true })
  cafc?: number | null;

  @Column({ type: 'text' })
  leyenda: string; //! Catalogos

  @Column({ type: 'text' })
  usuario: string;

  @Column({ type: 'int' })
  codigoDocumentoSector: number; //! Catalogos

  @Column({
    type: 'text',
    default: FacturaStatusEnum.PENDIENTE,
  })
  estado: FacturaStatusEnum;

  @Column({
    type: 'xml',
    nullable: true,
  })
  xml: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  codigoEmision: CodigoEmisionEnum;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

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

  @OneToMany(() => Detalle, (detalle) => detalle.factura, {
    cascade: true,
  })
  detalles: Detalle[];

  @ManyToOne(() => Paquete, (paquete) => paquete.facturas)
  paquete: Paquete;

  @OneToOne(() => SiatSync, (siatSync) => siatSync.factura, {
    cascade: true,
  })
  @JoinColumn()
  siatSync: SiatSync;
}
