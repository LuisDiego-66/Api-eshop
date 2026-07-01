import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('factura_counters')
@Unique(['codigoSucursal', 'codigoPuntoVenta'])
export class FacturaCounter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  codigoSucursal: number;

  @Column({ type: 'int' })
  codigoPuntoVenta: number;

  @Column({ type: 'int', default: 0 })
  ultimoNumero: number;
}
