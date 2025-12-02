import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductPaginationDto extends PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @IsNumber()
  days?: number;
}
