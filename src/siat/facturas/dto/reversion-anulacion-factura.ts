import { ApiProperty } from '@nestjs/swagger';

import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ReversionAnulacionFacturaDto {
  /*  @ApiProperty({
    description: 'Codigo Documento Sector de la Factura',
    example: 1,
  })
  @IsNumber()
  codigoDocumentoSector: number;

  @ApiProperty({
    description: 'Codigo Emision de la Factura',
    example: CodigoEmisionEnum.ONLINE,
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
    description: 'CUF de la Factura',
    example: '202DC8A36A3AB879F5F623937F1E756BF33B58F2E675B49B411CD8AF74',
  })
  @IsString()
  cuf: string; */

  @ApiProperty({
    description: 'Factura Id',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  facturaId: number;
}
