import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    example: 50,
  })
  @IsInt()
  @IsPositive()
  quantity: number;

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
