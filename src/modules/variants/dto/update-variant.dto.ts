import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateVariantDto {
  @ApiPropertyOptional({
    example: ['http://localhost:3000/api/files/product/imagen1.jpeg'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  multimedia: string[];

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ApiPropertyOptional({
    description: 'Product Id',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  productId: number;

  @ApiPropertyOptional({
    description: 'Color Id',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  colorId: number;
}
