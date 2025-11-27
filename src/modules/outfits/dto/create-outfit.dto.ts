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
    description: 'ProductColor IDs',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  productColorIds: number[];

  @ApiProperty({
    example: ['http://localhost:3000/api/files/product/imagen1.jpeg'],
  })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({
    example: ['http://localhost:3000/api/files/product/video1.mp4'],
  })
  @IsArray()
  @IsString({ each: true })
  videos: string[];
}
