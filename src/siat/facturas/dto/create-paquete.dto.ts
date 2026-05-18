import { IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  /* @ApiPropertyOptional({
    description: 'Código de Contingencia',
    example: 9538603,
  })
  @IsInt()
  @IsOptional()
  cafc: number; */
}
