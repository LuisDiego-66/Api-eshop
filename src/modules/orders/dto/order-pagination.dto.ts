import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderType } from '../enums';

export class OrderPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;
}
