import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Roles } from 'src/auth/enums/roles.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'Admin',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Rol del usuario',
    enum: Roles,
    example: Roles.ADMIN,
  })
  @IsOptional()
  @IsEnum(Roles)
  rol?: Roles;
}
