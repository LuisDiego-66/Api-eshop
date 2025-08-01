import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountMethod } from '../enums/discount-method.enum';

export class CreateDiscountDto {
  @ApiProperty({ example: 'Descuento de invierno' })
  @IsString()
  description: string;

  @ApiProperty({
    enum: DiscountMethod,
    example: DiscountMethod.FIXED,
  })
  @IsEnum(DiscountMethod)
  discountMethod: DiscountMethod;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
