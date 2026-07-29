import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaqueteContingenciaDto {
  @ApiProperty({
    description:
      'Id del evento significativo (ya registrado en SIAT) al que pertenecen las facturas a empaquetar',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  eventoSignificativoId: number;

  @ApiProperty({
    description: 'Código de Contingencia',
    example: '101A194B4341C',
  })
  @IsString()
  @IsNotEmpty()
  cafc: string;
}
