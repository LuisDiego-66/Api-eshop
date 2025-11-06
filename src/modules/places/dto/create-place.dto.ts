import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, ValidateNested } from 'class-validator';

import { CreateShipmentDto } from 'src/modules/shipments/dto';

import { PlacesEnum } from '../enums/places.enum';

export class CreatePlaceDto {
  @ApiProperty({ enum: PlacesEnum, example: PlacesEnum.TARIJA })
  @IsEnum(PlacesEnum)
  place: PlacesEnum;

  @ApiProperty({ type: [CreateShipmentDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateShipmentDto)
  shipments: CreateShipmentDto[];
}
