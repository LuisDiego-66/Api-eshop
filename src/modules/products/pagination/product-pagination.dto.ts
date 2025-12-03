import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

import { PaginationDto } from 'src/common/pagination/pagination.dto';

export enum DiscountFilter {
  true = 'true',
  false = 'false',
}

export class ProductPaginationDto extends PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @IsNumber()
  days?: number;

  @IsOptional()
  @IsEnum(DiscountFilter)
  discounts?: DiscountFilter;
}
