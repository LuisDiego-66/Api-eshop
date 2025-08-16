import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDiscountDto {
  @ApiProperty({ example: 'Descuento de invierno' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: 10,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsInt()
  value: number;
}
