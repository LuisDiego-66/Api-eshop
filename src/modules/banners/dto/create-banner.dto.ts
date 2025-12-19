import { IsEnum, IsString } from 'class-validator';
import { BannerType } from '../enums/banner-type.enum';
import { GenderType } from 'src/modules/categories/enums/gender-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBannerDto {
  @ApiProperty({ example: BannerType.DESKTOP })
  @IsString()
  @IsEnum(BannerType)
  type: BannerType;

  @ApiProperty({ example: GenderType.MALE })
  @IsString()
  @IsEnum(GenderType)
  gender: GenderType;

  @ApiProperty({ example: 'video.mp4' })
  @IsString()
  video: string;
}
