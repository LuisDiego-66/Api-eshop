import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, IsNumber } from 'class-validator';

export class AddDiscountsDto {
  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
    description: 'Products IDs',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  productsIds: number[];

  @ApiProperty({
    description: 'Discount Id',
    example: 1,
  })
  @IsNumber()
  discountId: number;
}
