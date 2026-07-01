import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class VerificacionEstadoFacturaDto {
  @ApiProperty({
    description: 'ID de la Factura',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  facturaId: number;
}
