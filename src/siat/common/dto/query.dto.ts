import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class QueryDto {
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
