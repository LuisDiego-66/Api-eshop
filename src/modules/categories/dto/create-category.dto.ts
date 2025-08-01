import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { GenderType } from '../enums/gender-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  displayOrder: number;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
