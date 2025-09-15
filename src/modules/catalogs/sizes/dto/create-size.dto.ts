import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateSizeDto {
  @ApiProperty({
    description: 'Unique',
    example: 'S',
  })
  @MaxLength(5)
  @IsString()
  name: string; // Ej: 'S', 'M', 'L', 'XL'
}
