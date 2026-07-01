import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidacionPaqueteFacturaDto {
  @ApiProperty({
    description: 'Codigo Recepcion del Paquete-Factura',
    example: '293f1a24-06be-11f1-b84b-fb859fab62cc',
  })
  @IsString()
  codigoRecepcion: string;
}
