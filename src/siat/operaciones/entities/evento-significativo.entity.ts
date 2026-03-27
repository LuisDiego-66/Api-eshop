import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('eventos_significativos')
export class EventoSignificativo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  codigoAmbiente: number;

  @Column({ type: 'int' })
  codigoMotivoEvento: number;

  @Column({ type: 'int' })
  codigoPuntoVenta: number;

  @Column({ type: 'text' })
  codigoSistema: string;

  @Column({ type: 'int' })
  codigoSucursal: number;

  @Column({ type: 'text' })
  codigoCufd: string;

  @Column({ type: 'text' })
  cufdEvento: string;

  @Column({ type: 'text' })
  codigoCuis: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'timestamptz' })
  fechaHoraFinEvento: Date;

  @Column({ type: 'timestamptz' })
  fechaHoraInicioEvento: Date;

  @Column({ type: 'bigint' })
  nit: number;

  //* ============================================================================================== */

  @Column({ type: 'bigint' })
  codigoRecepcionEventoSignificativo: number;

  @Column({ type: 'boolean' })
  transaccion: boolean;

  @Column({ type: 'timestamptz' })
  fechaRespuesta: Date;
}
