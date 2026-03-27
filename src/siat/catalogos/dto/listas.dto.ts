import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { ListasEnum } from '../enums/listas.enum';
import { IsEnum } from 'class-validator';

export class ListasDto {
  @ApiProperty({
    enum: ListasEnum,
    example: ListasEnum.Actividades,
  })
  @Type(() => String)
  @IsEnum(ListasEnum)
  metodo: ListasEnum;
}
