import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    example: 'admin@gmail.com',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    example: '123456',
  })
  @IsString()
  password: string;
}
