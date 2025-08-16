import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({
    example: 3,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Variant Id',
    example: 1,
  })
  @IsNumber()
  variant: number;
}
