import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { CreateDiscountDto } from './create-discount.dto';
import { IsEnum, IsNumber, Max, Min, ValidateIf } from 'class-validator';
import { DiscountMethod } from '../enums/discount-method.enum';
import { DiscountType } from '../enums/discount-type.enum';

export class CreatePermanentDiscountDto extends CreateDiscountDto {
  @ApiHideProperty()
  @IsEnum(DiscountType)
  discountType: DiscountType = DiscountType.PERMANENT;

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
