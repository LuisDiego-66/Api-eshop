import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { GenderType } from 'src/modules/categories/enums/gender-type.enum';
import { SliderType } from '../enums/slider-type.enum';

export class CreateSliderDto {
  @ApiProperty({
    example: 'name of slider',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
  })
  @IsString()
  image: string;

  @ApiProperty({
    example: 'button text',
  })
  @IsString()
  button_text: string;

  @ApiProperty({
    example: 'https://example.com',
  })
  @IsString()
  url: string;

  @ApiProperty({
    enum: SliderType,
    example: SliderType.DESKTOP,
  })
  @IsEnum(SliderType)
  slider_type: SliderType;

  @ApiProperty({
    enum: GenderType,
    example: GenderType.MALE,
  })
  @IsEnum(GenderType)
  gender: GenderType;
}
