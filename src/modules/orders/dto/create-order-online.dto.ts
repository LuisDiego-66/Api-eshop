import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { BillingDto } from '../../billings/dto/billing.dto';

export class CreateOrderOnlineDto {
  @ApiProperty({
    description: 'Token items',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYXJ0IjpbeyJ2YXJpYW50SWQiOjIsInF1YW50aXR5IjozfV0sImlhdCI6MTc1NjEzNDkzNywiZXhwIjoxNzU2MjIxMzM3fQ',
  })
  @IsString()
  items: string;

  @ApiProperty({
    example: 'juan',
  })
  @IsString()
  name?: string;

  @ApiProperty({
    example: '78926281',
  })
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Shipment Id',
    example: 1,
  })
  @IsNumber()
  shipment: number;

  @ApiProperty({
    description: 'Address Id',
    example: 1,
  })
  @IsNumber()
  address: number;

  @ApiPropertyOptional({
    example: 'admin@gmail.com',
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({
    type: BillingDto,
    description: 'Datos de facturación',
  })
  @ValidateNested()
  @Type(() => BillingDto)
  @IsDefined()
  billing: BillingDto;

  /* @ApiProperty({
    description: 'Código Método de Pago (catálogo SIAT)',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Max(308)
  codigoMetodoPago: number; */
}
