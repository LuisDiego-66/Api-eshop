import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddDiscountsAllDto {
  @ApiProperty({
    description: 'Discount Id',
    example: 1,
  })
  @IsNumber()
  discountId: number;
}
