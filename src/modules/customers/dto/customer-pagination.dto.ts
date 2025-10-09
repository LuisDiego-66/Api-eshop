import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { CustomerType } from '../enums/customer-type.enum';

export class CustomerPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;
}
