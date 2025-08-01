import { PartialType } from '@nestjs/swagger';
import { CreateSeasonalDiscountDto } from './create-seasonal-discount.dto';

export class UpdateSeasonalDiscountDto extends PartialType(
  CreateSeasonalDiscountDto,
) {}
