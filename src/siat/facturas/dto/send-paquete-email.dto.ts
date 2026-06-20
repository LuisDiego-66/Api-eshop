import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsPositive } from 'class-validator';

export class SendPaqueteEmailDto {
  @ApiProperty({ example: 'cliente@empresa.com', description: 'Correo destino' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 1, description: 'ID del paquete en la base de datos' })
  @IsInt()
  @IsPositive()
  paqueteId: number;
}
