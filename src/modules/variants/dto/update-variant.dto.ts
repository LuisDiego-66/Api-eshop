import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateVariantsDto } from './create-variants.dto';

export class UpdateVariantDto extends PartialType(
  OmitType(CreateVariantsDto, ['productId', 'colorId'] as const),
) {}
