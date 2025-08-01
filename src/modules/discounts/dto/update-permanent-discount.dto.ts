import { PartialType } from '@nestjs/swagger';
import { CreatePermanentDiscountDto } from './create-permanent-discount.dto';

export class UpdatePermanentDiscountDto extends PartialType(
  CreatePermanentDiscountDto,
) {}
