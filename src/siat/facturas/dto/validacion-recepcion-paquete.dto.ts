import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { CodigoEmisionEnum } from '../enums/codigo-emision.enum';

export class ValidacionPaqueteFacturaDto {
  @ApiProperty({
    description: 'Codigo Documento Sector de la Factura',
    example: 1,
  })
  @IsNumber()
  codigoDocumentoSector: number;

  @ApiProperty({
    description: 'Codigo Emision de la Factura',
    example: CodigoEmisionEnum.OFFLINE,
    enum: CodigoEmisionEnum,
  })
  @IsEnum(CodigoEmisionEnum)
  codigoEmision: CodigoEmisionEnum;

  @ApiProperty({
    description: 'Tipo Factura Documento de la Factura',
    example: 1,
  })
  @IsNumber()
  tipoFacturaDocumento: number;

  @ApiProperty({
    description: 'Codigo Recepcion del Paquete-Factura',
    example: '293f1a24-06be-11f1-b84b-fb859fab62cc',
  })
  @IsString()
  codigoRecepcion: string;
}
