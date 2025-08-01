import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSubcategoryDto {
  @ApiProperty({
    example: 'shirts',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  enabled: boolean;

  @ApiProperty({
    description: 'Category Id',
    example: 1,
  })
  @IsNumber()
  category: number;
}
