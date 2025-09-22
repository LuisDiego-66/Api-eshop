import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { GenderType } from '../enums/gender-type.enum';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Category Male',
  })
  @IsString()
  name: string;

  @ApiProperty({
    enum: GenderType,
    example: GenderType.MALE,
  })
  @IsEnum(GenderType)
  gender: GenderType;
}
