import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({
    description: 'Unique Field',
    example: 'brand 1',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'description 1',
  })
  @IsString()
  description?: string;
}
