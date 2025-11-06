import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateShipmentDto {
  @IsString()
  @ApiProperty({
    example: 'name',
  })
  name: string;

  @ApiProperty({
    example: '99.99',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,2})?$/)
  price: string; //! string
}
