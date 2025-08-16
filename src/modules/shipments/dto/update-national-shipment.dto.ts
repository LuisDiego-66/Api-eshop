import { PartialType } from '@nestjs/swagger';
import { CreateNationalShipmentDto } from './create-national-shipment.dto';

export class UpdateNationalShipmentDto extends PartialType(
  CreateNationalShipmentDto,
) {}
