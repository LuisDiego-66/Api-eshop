import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderType } from '../enums/order-type.enum';
import {
  IsArray,
  IsEnum,
  IsNumber,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateItemDto } from './create-item.dto';

export abstract class CreateOrderDto {
  @ApiProperty({ enum: OrderType })
  @IsEnum(OrderType)
  type: OrderType;

  @ApiProperty({ type: CreateItemDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  items: CreateItemDto[];

  @ApiPropertyOptional({
    description: 'Customer Id',
    example: 1,
  })
  @ValidateIf((o) => o.type === OrderType.ONLINE)
  @IsNumber()
  customer?: number;

  @ApiPropertyOptional({
    description: 'Shipment Id',
    example: 1,
  })
  @ValidateIf((o) => o.type === OrderType.ONLINE)
  @IsNumber()
  shipment?: number;

  @ApiPropertyOptional({
    description: 'Address Id',
    example: 1,
  })
  @ValidateIf((o) => o.type === OrderType.ONLINE)
  @IsNumber()
  address?: number;
}
