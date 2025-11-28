import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsString,
} from 'class-validator';

import { GenderType } from 'src/modules/categories/enums/gender-type.enum';

export class CreateOutfitDto {
  @ApiProperty({
    example: 'name of the outfit',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
    description: 'ProductColor IDs',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  productColorIds: number[];

  @ApiProperty({
    example: ['http://localhost:3000/api/files/product/imagen1.jpeg'],
  })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({
    example: ['http://localhost:3000/api/files/product/video1.mp4'],
  })
  @IsArray()
  @IsString({ each: true })
  videos: string[];

  @ApiProperty({
    enum: GenderType,
    example: GenderType.MALE,
  })
  @IsEnum(GenderType)
  gender: GenderType;
}
