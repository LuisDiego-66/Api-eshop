import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({
    description: 'Código de sucursal asignado por SIAT en el RNC',
    example: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  codigoSucursal: number;

  @ApiProperty({
    example: 'Casa Matriz',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Alias o nombre corto de la sucursal',
    example: 'CM',
  })
  @IsString()
  alias: string;

  @ApiProperty({
    example: 'EMPRESA DEMO S.R.L.',
  })
  @IsString()
  razonSocial: string;

  @ApiProperty({
    description:
      'Actividad económica (catálogo SIAT), la misma para todas las sucursales',
    example: '477110',
  })
  @IsString()
  actividadEconomica: string;

  @ApiProperty({
    example: 'Av. Siempre Viva #123',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: 'Chuquisaca',
  })
  @IsString()
  departamento: string;

  @ApiProperty({
    example: 'Sucre',
  })
  @IsString()
  municipio: string;

  @ApiProperty({
    example: '74409411',
  })
  @IsString()
  telefono: string;

  @ApiProperty({
    description: 'Whether the branch is currently active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
