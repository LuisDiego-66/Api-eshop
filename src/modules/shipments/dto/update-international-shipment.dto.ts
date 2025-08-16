import { PartialType } from '@nestjs/swagger';
import { CreateInternationalShipmentDto } from './create-international-shipment.dto';

export class UpdateInternationalShipmentDto extends PartialType(
  CreateInternationalShipmentDto,
) {}
