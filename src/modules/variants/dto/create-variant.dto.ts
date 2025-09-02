import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVariantDto {
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
    example: [
      'http://localhost:3000/api/files/product/imagen1.jpeg',
      'http://localhost:3000/api/files/product/imagen1.jpeg',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  multimedia: string[];

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

  @ApiProperty({
    description: 'Size Id',
    example: 1,
  })
  @IsNumber()
  size: number;
}
