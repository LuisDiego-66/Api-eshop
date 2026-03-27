import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class QuerySucursalDto {
  @ApiProperty({
    description: 'Código Sucursal',
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  codigoSucursal: number;
}
