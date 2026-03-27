import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Factura } from './factura.entity';

@Entity('detalles')
export class Detalle {
  @PrimaryGeneratedColumn()
  id: number;

  //* ============================================================================================== */
  //* Catalogos

  @Column({ type: 'text' })
  actividadEconomica: string;

  @Column({ type: 'int' })
  codigoProductoSin: number;

  //* ============================================================================================== */
  //* Sistema

  @Column({ type: 'text' })
  codigoProducto: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  cantidad: number;

  @Column({ type: 'int' })
  unidadMedida: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  montoDescuento?: number | null;

  //* ============================================================================================== */
  //* Campos opcionales para productos con serie/IMEI

  @Column({ type: 'text', nullable: true })
  numeroSerie?: string | null;

  @Column({ type: 'text', nullable: true })
  numeroImei?: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subTotal: number;

  //* ============================================================================================== */
  //*                                        Relations                                               */
  //* ============================================================================================== */

  @ManyToOne(() => Factura, (factura) => factura.detalles, {
    onDelete: 'CASCADE',
  })
  factura: Factura;
}
