import { ChildEntity, Column } from 'typeorm';
import { Shipment } from './shipment.entity';

@ChildEntity('international')
export class InternationalShipment extends Shipment {
  @Column()
  country: string;

  @Column()
  address_text: string;

  @Column({ nullable: true })
  postal_code: string;
}
