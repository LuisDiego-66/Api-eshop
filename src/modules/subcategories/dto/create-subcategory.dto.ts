import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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

  @ApiPropertyOptional({
    example: ['http://localhost:3000/api/files/product/video.mp4'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  videos: string[];

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ApiProperty({
    description: 'Category Id',
    example: 1,
  })
  @IsNumber()
  category: number;
}
