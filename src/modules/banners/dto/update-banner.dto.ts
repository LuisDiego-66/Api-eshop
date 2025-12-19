import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateBannerDto {
  @ApiProperty({ example: 'video.mp4' })
  @IsString()
  video: string;
}
