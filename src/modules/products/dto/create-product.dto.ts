import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Name of the product',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Description of the product',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: '10.00',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,2})?$/)
  price: string; //! string

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        SIAT                                                    */
  //* ---------------------------------------------------------------------------------------------- */

  /* @ApiPropertyOptional({
    description: 'Código de producto SIN (catálogo SIAT), requerido para facturar',
    example: 62233,
  })
  @IsOptional()
  @IsNumber()
  codigoProductoSin?: number;

  @ApiPropertyOptional({
    description: 'Actividad económica (catálogo SIAT), requerido para facturar',
    example: '477110',
  })
  @IsOptional()
  @IsString()
  actividadEconomica?: string;

  @ApiPropertyOptional({
    description: 'Unidad de medida (catálogo SIAT), requerido para facturar',
    example: 62,
  })
  @IsOptional()
  @IsNumber()
  unidadMedida?: number; */

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ApiProperty({
    description: 'Subcategoy Id',
    example: 1,
  })
  @IsNumber()
  subcategory: number;

  @ApiPropertyOptional({
    description: 'Brand Id',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  brand?: number;

  @ApiPropertyOptional({
    description: 'Discount Id',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  discount?: number;
}
