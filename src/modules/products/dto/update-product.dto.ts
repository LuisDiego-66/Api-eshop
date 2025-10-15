import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(
  CreateProductDto,
  /* OmitType(CreateProductDto, ['discount'] as const), */
) {}
