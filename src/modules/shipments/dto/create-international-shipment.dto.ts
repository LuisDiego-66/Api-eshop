import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateInternationalShipmentDto {
  @IsString()
  @ApiProperty({
    example: 'country',
  })
  @IsString()
  country: string;

  @IsString()
  @ApiProperty({
    example: 'address text ',
  })
  @IsString()
  address_text: string;

  @IsString()
  @ApiProperty({
    example: 'postal_code',
  })
  @IsString()
  postal_code: string;
}
