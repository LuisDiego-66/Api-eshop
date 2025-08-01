import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateColorDto {
  @ApiProperty({
    example: 'red',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '#0000000',
  })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  enabled: boolean;
}
