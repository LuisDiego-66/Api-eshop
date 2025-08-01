import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';

@Entity('shipments')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
//@Entity('shipments')
export abstract class Shipment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column('text')
  method: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string; //! string

  @Column('boolean', { default: true })
  enabled: boolean;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @DeleteDateColumn({ nullable: true, select: false })
  deletedAt: Date;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */
}
