import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class getCuisDto {
  @ApiProperty({
    description: 'Código Punto Venta',
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  codigoPuntoVenta: number;

  @ApiProperty({
    description: 'Código Punto Venta',
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  codigoSucursal: number;
}
