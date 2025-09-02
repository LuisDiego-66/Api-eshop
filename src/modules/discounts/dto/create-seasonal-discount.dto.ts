import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, ValidateIf } from 'class-validator';

import { CreateDiscountDto } from './create-discount.dto';
import { DiscountType } from '../enums/discount-type.enum';

export class CreateSeasonalDiscountDto extends CreateDiscountDto {
  @ApiHideProperty()
  @IsEnum(DiscountType)
  discountType: DiscountType = DiscountType.SEASONAL;

  @ApiProperty({
    example: '2025-12-01T00:00:00.000Z',
  })
  @ValidateIf((o) => o.discountType === DiscountType.SEASONAL)
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    example: '2025-12-31T23:59:59.000Z',
  })
  @ValidateIf((o) => o.discountType === DiscountType.SEASONAL)
  @IsDateString()
  endDate: Date;
}
