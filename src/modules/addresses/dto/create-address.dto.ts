import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    example: 'Name of the address',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '123 Main St, Apt 4B, Springfield, IL 62704',
  })
  @IsString()
  @IsString()
  address: string;

  @ApiProperty({
    example: 'Springfield',
  })
  @IsString()
  @IsString()
  city: string;
}
