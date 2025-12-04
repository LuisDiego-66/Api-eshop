import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateAdvertisementDto {
  @ApiProperty({ example: 'This is an advertisement text' })
  @IsString()
  text: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  enabled: boolean;
}
