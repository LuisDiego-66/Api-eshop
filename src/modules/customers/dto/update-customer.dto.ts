import { PartialType, PickType } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(
  PickType(CreateCustomerDto, ['name', 'phone'] as const),
) {}
