import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { ParametricasEnum } from '../enums/parametricas.enum';
import { IsEnum, IsString } from 'class-validator';

export class ParametricasDto {
  @ApiProperty({
    enum: ParametricasEnum,
    example: ParametricasEnum.EventosSignificativos,
  })
  @Type(() => String)
  @IsEnum(ParametricasEnum)
  metodo: ParametricasEnum;
}
