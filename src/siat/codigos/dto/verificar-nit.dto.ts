import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class VerificarNitDto {
  @ApiProperty({
    description: 'NIT a verificar',
    example: 1234567890,
  })
  @IsNumber()
  @IsNotEmpty()
  nitParaVerificacion: number;
}
