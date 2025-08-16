import { ApiHideProperty } from '@nestjs/swagger';
import { CreateDiscountDto } from './create-discount.dto';
import { IsEnum } from 'class-validator';
import { DiscountType } from '../enums/discount-type.enum';

export class CreatePermanentDiscountDto extends CreateDiscountDto {
  @ApiHideProperty()
  @IsEnum(DiscountType)
  discountType: DiscountType = DiscountType.PERMANENT;
}
