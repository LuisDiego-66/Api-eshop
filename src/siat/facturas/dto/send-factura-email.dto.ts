import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsPositive } from 'class-validator';

export class SendFacturaEmailDto {
  @ApiProperty({ example: 'prueba@siat.gob.bo', description: 'Correo destino' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 1, description: 'ID de la factura en la base de datos' })
  @IsInt()
  @IsPositive()
  facturaId: number;
}
