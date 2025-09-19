import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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
}
