import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateAdvertisementDto {
  @ApiProperty({ example: 'video.mp4' })
  @IsString()
  video: string;
}
