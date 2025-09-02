import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { CreateItemDto } from 'src/modules/orders/dto';

export class CreateCartDto {
  @ApiProperty({ type: [CreateItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  items: CreateItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  token?: string;
}
