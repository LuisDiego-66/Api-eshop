import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateVariantsDto } from './create-variant.dto';

export class UpdateVariantDto extends PartialType(
  OmitType(CreateVariantsDto, [
    'productId' /* 'colorName', 'colorCode' */,
  ] as const),
) {}
