import { IsISO8601, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConsultaEventoSignificativoDto {
  @ApiProperty({
    description: 'Fecha del evento significativo a consultar (ISO 8601)',
    example: '2026-02-10',
  })
  @IsISO8601()
  @IsNotEmpty()
  fechaEvento: string;

  @ApiProperty({
    description: 'Código Punto Venta',
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  codigoPuntoVenta: number;
}
