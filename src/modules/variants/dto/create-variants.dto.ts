import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  size: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateVariantsDto {
  @ApiPropertyOptional({
    example: ['http://localhost:3000/api/files/product/imagen1.jpeg'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  multimedia: string[];

  @ApiPropertyOptional({
    example: ['http://localhost:3000/api/files/product/document.pdf'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  pdfs: string[];

  @ApiProperty({
    type: [CreateVariantDto],
    example: [
      { size: 's', quantity: 10 },
      { size: 'm', quantity: 5 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];

  @ApiProperty({
    description: 'Color Name',
    example: 'red',
  })
  @IsString()
  colorName: string;

  @ApiProperty({
    description: 'Color Hexadecimal',
    example: '#FF5733',
  })
  @IsString()
  colorCode: string;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ApiProperty({
    description: 'Product Id',
    example: 1,
  })
  @IsNumber()
  productId: number;
}
