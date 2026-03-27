import {
  Entity,
  Column,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('puntos-venta')
export class PuntoVenta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  codigoAmbiente: number;

  @Column({ type: 'int' })
  codigoModalidad: number;

  @Column({ type: 'text' })
  codigoSistema: string;

  @Column({ type: 'int' })
  codigoSucursal: number;

  @Column({ type: 'int' })
  codigoTipoPuntoVenta: number;

  @Column({ type: 'text' })
  codigoCuis: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'bigint' })
  nit: number;

  @Column({ type: 'text' })
  nombrePuntoVenta: string;

  //* ============================================================================================== */

  @Column({ type: 'int' })
  codigoPuntoVenta: number;

  @Column({ type: 'boolean' })
  transaccion: boolean;

  @Column({ type: 'timestamptz' })
  fechaRespuesta: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt: Date;
}
