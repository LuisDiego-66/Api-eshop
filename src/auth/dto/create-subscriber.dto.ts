import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateSubscriberDto {
  @ApiProperty({
    example: 'subscriber@gmail.com',
  })
  @IsEmail()
  @IsString()
  email: string;
}
