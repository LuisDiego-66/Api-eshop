import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { CreateMultimediaDto } from 'src/modules/multimedia/dto/create-multimedia.dto';

export class CreateVariantDto {
  @ApiProperty({
    example: 'Name of the variant',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Description of the variant',
    description: 'default: 0',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    example: 4,
  })
  @IsNumber()
  stock?: number; //! opcional

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ApiProperty({
    description: 'Product Id',
    example: 1,
  })
  @IsNumber()
  product: number;

  @ApiProperty({
    description: 'Color Id',
    example: 1,
  })
  @IsNumber()
  color: number;

  @ApiProperty({
    description: 'Size Id',
    example: 1,
  })
  @IsNumber()
  size: number;

  @ApiProperty({ type: CreateMultimediaDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMultimediaDto)
  multimedia: CreateMultimediaDto[];
}
