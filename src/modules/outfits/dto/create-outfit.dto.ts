import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, IsString } from 'class-validator';

export class CreateOutfitDto {
  @ApiProperty({
    example: 'name of the outfit',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
    description: 'Variants IDs',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  variantIds: number[];
}
