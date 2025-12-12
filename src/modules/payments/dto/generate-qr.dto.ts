import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

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

  @ApiPropertyOptional({
    description: 'gloss',
    example: 'PAGO TIENDA MONERO',
  })
  @IsString()
  @IsOptional()
  gloss?: string;
}
