import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

import { PaginationDto } from 'src/common/pagination/pagination.dto';

import { OrderType } from '../enums';

export class OrderPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @IsNumber()
  days?: number;
}
