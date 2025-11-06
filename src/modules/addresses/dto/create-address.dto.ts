import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { AddressType } from '../enums/address-type.enum';

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

  @ApiPropertyOptional({
    example: 'Springfield',
  })
  @IsOptional()
  @IsString()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'USA',
  })
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    example: '62704',
  })
  @IsOptional()
  postal_code?: string;

  @ApiProperty({ enum: AddressType, example: AddressType.NATIONAL })
  @IsEnum(AddressType)
  type: AddressType;

  //* ---------------------------------------------------------------------------------------------- */
  //*                                        Relations                                               */
  //* ---------------------------------------------------------------------------------------------- */

  @ApiPropertyOptional({
    description: 'Place Id',
    example: '1',
  })
  @IsOptional()
  @IsNumber()
  place?: number;
}
