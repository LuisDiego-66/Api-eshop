import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsInt,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { PaymentType } from '../enums';
import { BillingDto } from '../../billings/dto/billing.dto';

export class CreateOrderInStoreDto {
  @ApiProperty({
    description: 'Token items',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYXJ0IjpbeyJ2YXJpYW50SWQiOjIsInF1YW50aXR5IjozfV0sImlhdCI6MTc1NjEzNDkzNywiZXhwIjoxNzU2MjIxMzM3fQ',
  })
  @IsString()
  items: string;

  @ApiProperty({
    example: PaymentType.CASH,
    enum: PaymentType,
  })
  @IsString()
  @IsEnum(PaymentType)
  payment_type: PaymentType;

  /*   @ApiProperty({
    description: 'Código Método de Pago (catálogo SIAT)',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Max(308)
  codigoMetodoPago: number; */

  @ApiProperty({
    type: BillingDto,
    description: 'Datos de facturación',
  })
  @ValidateNested()
  @Type(() => BillingDto)
  @IsDefined()
  billing: BillingDto;
}
