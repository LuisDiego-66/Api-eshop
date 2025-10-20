import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { OrderType } from '../enums/order-type.enum';
import { IsEnum, IsString } from 'class-validator';

export abstract class CreateOrderInStoreDto {
  @ApiHideProperty()
  @IsEnum(OrderType)
  type: OrderType = OrderType.IN_STORE;

  @ApiProperty({
    description: 'Token items',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYXJ0IjpbeyJ2YXJpYW50SWQiOjIsInF1YW50aXR5IjozfV0sImlhdCI6MTc1NjEzNDkzNywiZXhwIjoxNzU2MjIxMzM3fQ',
  })
  @IsString()
  items: string;
}
