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

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ApiProperty({
    description: 'Product Id',
    example: 1,
  })
  @IsNumber()
  productId: number;

  @ApiProperty({
    description: 'Color Id',
    example: 1,
  })
  @IsNumber()
  colorId: number;
}
