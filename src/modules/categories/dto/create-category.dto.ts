import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString } from 'class-validator';

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

  @ApiProperty({
    example: 'http://localhost:3000/api/files/product/video.mp4',
  })
  @IsString()
  image: string;
}
