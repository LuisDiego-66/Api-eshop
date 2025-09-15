import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class CreateVariantSizeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  size: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateVariantsDto {
  @ApiProperty({
    example: 'Name of the variant',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Description of the variant',
    description: 'default: 0',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: ['http://localhost:3000/api/files/product/imagen1.jpeg'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  multimedia: string[];

  @ApiProperty({
    type: [CreateVariantSizeDto],
    example: [
      { size: 's', quantity: 10 },
      { size: 'm', quantity: 5 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantSizeDto)
  sizes: CreateVariantSizeDto[];

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ApiProperty({
    description: 'Product Id',
    example: 1,
  })
  @IsNumber()
  product: number;

  @ApiProperty({
    description: 'Color Id',
    example: 1,
  })
  @IsNumber()
  color: number;
}
