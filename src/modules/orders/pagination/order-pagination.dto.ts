import { IsDateString, IsEnum, IsOptional } from 'class-validator';

import { PaginationDto } from 'src/common/pagination/pagination.dto';

import { OrderType, PaymentType } from '../enums';

export class OrderPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
