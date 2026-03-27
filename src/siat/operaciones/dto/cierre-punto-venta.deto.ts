import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CierrePuntoVentaDto {
  @ApiProperty({
    description: 'Código del Punto de Venta',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  codigoPuntoVenta: number;
}
