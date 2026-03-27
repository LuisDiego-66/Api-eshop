import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistroPuntoVentaDto {
  @ApiProperty({
    description: 'Código del tipo de punto de venta (catálogo SIAT)',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  codigoTipoPuntoVenta: number;

  @ApiProperty({
    description: 'Descripción del punto de venta',
    example: 'Sucursal central - Caja 1',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({
    description: 'Nombre del punto de venta',
    example: 'Punto Venta Central',
  })
  @IsString()
  @IsNotEmpty()
  nombrePuntoVenta: string;
}
