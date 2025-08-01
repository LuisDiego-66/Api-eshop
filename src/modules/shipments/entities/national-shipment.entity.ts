import { ChildEntity, Column } from 'typeorm';
import { Shipment } from './shipment.entity';

@ChildEntity('national')
export class NationalShipment extends Shipment {
  @Column()
  name: string;
}
