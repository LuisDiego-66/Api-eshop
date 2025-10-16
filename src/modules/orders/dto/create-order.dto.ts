import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderType } from '../enums/order-type.enum';
import { IsEnum, IsNumber, IsString, ValidateIf } from 'class-validator';

export abstract class CreateOrderDto {
  @ApiProperty({ enum: OrderType, example: OrderType.IN_STORE })
  @IsEnum(OrderType)
  type: OrderType;

  @ApiProperty({
    description: 'Token items',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYXJ0IjpbeyJ2YXJpYW50SWQiOjIsInF1YW50aXR5IjozfV0sImlhdCI6MTc1NjEzNDkzNywiZXhwIjoxNzU2MjIxMzM3fQ',
  })
  @IsString()
  items: string;

  @ApiPropertyOptional({
    description: 'Customer Id',
    example: 1,
  })
  @ValidateIf((o) => o.type === OrderType.ONLINE)
  @IsNumber()
  customer?: number;

  @ApiPropertyOptional({
    description: 'Shipment Id',
    example: 1,
  })
  @ValidateIf((o) => o.type === OrderType.ONLINE)
  @IsNumber()
  shipment?: number;

  @ApiPropertyOptional({
    description: 'Address Id',
    example: 1,
  })
  @ValidateIf((o) => o.type === OrderType.ONLINE)
  @IsNumber()
  address?: number;
}
