import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsISO8601,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistroEventoSignificativoDto {
  @ApiProperty({
    description: 'Código del motivo del evento significativo (catálogo SIAT)',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  codigoMotivoEvento: number;

  @ApiProperty({
    description:
      'Id del CUFD (puede ser de días anteriores) que estaba vigente durante el evento',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  cufdId: number;

  @ApiProperty({
    description: 'Descripción del evento significativo (catálogo SIAT)',
    example: 'INACCESIBILIDAD AL SERVICIO WEB DE LA ADMINISTRACIÓN TRIBUTARIA',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({
    description: 'Fecha y hora de inicio del evento (ISO 8601)',
    example: '2026-02-09T10:00:00',
  })
  @IsISO8601()
  @IsNotEmpty()
  fechaHoraInicioEvento: string;

  @ApiProperty({
    description: 'Fecha y hora de fin del evento (ISO 8601)',
    example: '2026-02-09T12:30:00',
  })
  @IsISO8601()
  @IsNotEmpty()
  fechaHoraFinEvento: string;
}
