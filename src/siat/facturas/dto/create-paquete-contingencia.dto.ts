import {
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaqueteContingenciaDto {
  /*   @ApiProperty({
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
  tipoFacturaDocumento: number; */

  @ApiProperty({
    description: 'Descripcion del evento: (Catalogos Siat)',
    example: 'VIRUS INFORMÁTICO O FALLA DE SOFTWARE',
  })
  @IsString()
  @IsNotEmpty()
  descripcionEvento: string;

  @ApiProperty({
    description: 'Codigo Evento (Catalogos Siat)',
    example: 5,
  })
  @IsInt()
  @IsNotEmpty()
  codigoEvento: number;

  @ApiProperty({
    description: 'Código de Contingencia',
    example: '101A194B4341C',
  })
  @IsString()
  cafc: string;
}
