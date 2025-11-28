import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAdvertisementDto {
  @ApiProperty({ example: 'This is an advertisement text' })
  @IsString()
  text: string;
}
