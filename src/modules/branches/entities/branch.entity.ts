import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true }) //! branch code assigned by SIAT in the RNC
  codigoSucursal: number;

  @Column('text')
  name: string;

  @Column('text')
  alias: string;

  @Column('text')
  razonSocial: string;

  @Column('text') //! catálogo SIAT: mismo valor para todas las sucursales
  actividadEconomica: string;

  @Column('text')
  address: string;

  @Column('text')
  departamento: string;

  @Column('text')
  municipio: string;

  @Column('text')
  telefono: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt?: Date;
}
