import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GenerateQRDto {
  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ApiProperty({
    description: 'Order Id',
    example: 1,
  })
  @IsNumber()
  orderId: number;
}
