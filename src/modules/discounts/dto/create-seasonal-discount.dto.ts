import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { CreateDiscountDto } from './create-discount.dto';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { DiscountType } from '../enums/discount-type.enum';
import { DiscountMethod } from '../enums/discount-method.enum';

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

  @ApiProperty({
    example: 15.5,
    minimum: 0,
    maximum: 100,
  })
  @ValidateIf((o) => o.discountMethod === DiscountMethod.PERCENTAGE)
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;

  @ApiProperty({
    example: 20.0,
    minimum: 0,
  })
  @ValidateIf((o) => o.discountMethod === DiscountMethod.FIXED)
  @IsNumber()
  @Min(0)
  fixedAmount?: number;
}
