import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({
    description: 'Variant Id',
    example: 1,
  })
  @IsInt()
  @IsNumber()
  variantId: number;

  @ApiProperty({
    example: 3,
  })
  @IsInt()
  @IsNumber()
  @Min(1)
  quantity: number;
}
