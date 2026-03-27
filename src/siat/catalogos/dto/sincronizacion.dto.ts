import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class SincronizacionDto {
  @ApiProperty({
    description: 'Código Punto Venta',
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  codigoPuntoVenta: number;
}
