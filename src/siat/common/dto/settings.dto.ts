import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

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
}
