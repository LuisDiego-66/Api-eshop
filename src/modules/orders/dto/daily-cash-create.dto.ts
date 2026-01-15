import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsNotEmpty } from 'class-validator';

export class CreateDailyCashDto {
  @ApiProperty({ example: '200.00' })
  @IsNotEmpty()
  @IsDecimal()
  quantity: string;
}
