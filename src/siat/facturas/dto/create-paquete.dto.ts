import { IsEnum, IsInt, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CodigoEmisionEnum } from '../enums/codigo-emision.enum';

export class CreatePaqueteDto {
  @ApiProperty({
    description: 'Codigo Documento Sector de la Factura',
    example: 1,
  })
  @IsNumber()
  codigoDocumentoSector: number;

  @ApiProperty({
    description: 'Tipo Factura Documento de la Factura',
    example: 1,
  })
  @IsNumber()
  tipoFacturaDocumento: number;

  @ApiProperty({
    description: 'Código del evento significativo asociado',
    example: 9538603,
  })
  @IsInt()
  @IsNotEmpty()
  codigoEvento: number;
}
