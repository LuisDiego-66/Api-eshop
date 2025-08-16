import { ChildEntity, Column } from 'typeorm';
import { Shipment } from './shipment.entity';

@ChildEntity('national')
export class NationalShipment extends Shipment {
  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string; //! string
}
