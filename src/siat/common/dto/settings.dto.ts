import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

import { PaginationDto } from 'src/common/pagination/pagination.dto';

export class SettingsDto {
  @ApiProperty({
    description: 'Código Sucursal',
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  codigoSucursal: number;

  @ApiProperty({
    description: 'Código Punto Venta',
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  codigoPuntoVenta: number;
}

export class SettingsPaginationDto extends PaginationDto {
  @ApiProperty({
    description: 'Código Sucursal',
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  codigoSucursal: number;

  @ApiProperty({
    description: 'Código Punto Venta',
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  codigoPuntoVenta: number;

  @ApiProperty({
    description: 'Fecha inicio (filtro por fechaEmision)',
    example: '2026-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiProperty({
    description: 'Fecha fin (filtro por fechaEmision)',
    example: '2026-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
