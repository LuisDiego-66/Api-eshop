import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNegative,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class SubtractStockDto {
  @ApiProperty({
    example: 50,
  })
  @IsInt()
  @IsNegative()
  quantity: number;

  @ApiProperty({
    example: 'reason of stock subtraction',
  })
  @IsString()
  reason: string;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ApiProperty({
    description: 'ID de la variante',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  variantId: number;
}
