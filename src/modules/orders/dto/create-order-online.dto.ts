import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export /* abstract */ class CreateOrderOnlineDto {
  @ApiProperty({
    description: 'Token items',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYXJ0IjpbeyJ2YXJpYW50SWQiOjIsInF1YW50aXR5IjozfV0sImlhdCI6MTc1NjEzNDkzNywiZXhwIjoxNzU2MjIxMzM3fQ',
  })
  @IsString()
  items: string;

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
}
