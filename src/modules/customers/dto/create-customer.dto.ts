import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

import { AuthProviders } from 'src/auth/enums/providers.enum';

export class CreateCustomerDto {
  @ApiProperty({
    example: 'juan',
  })
  @IsString()
  name: string;

  @ApiHideProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiHideProperty()
  @IsEnum(AuthProviders)
  provider: AuthProviders; //! Enum

  @ApiHideProperty()
  @IsString()
  idProvider: string;

  @ApiPropertyOptional({
    example: '78926281',
  })
  @IsOptional()
  phone?: string;
}
