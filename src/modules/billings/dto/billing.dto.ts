import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BillingDto {
  @ApiProperty({
    description: 'Número de documento (CI) o nit',
    example: '12345678',
  })
  @IsString()
  ci: string;

  @ApiPropertyOptional({
    description: 'Nombre o razón social',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono',
    example: '77777777',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico',
    example: 'juan@gmail.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Complemento del CI',
    example: 'LP',
  })
  @IsOptional()
  @IsString()
  complemento?: string;

  @ApiProperty({
    description: 'Código del tipo de documento de identidad (Catalogos)',
    example: 1,
  })
  @IsNumber()
  codigoTipoDocumentoIdentidad: number;
}
