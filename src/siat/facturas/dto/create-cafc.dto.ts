import { Min, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCafcDto {
  @ApiProperty({
    description: 'Codigo Cafc',
    example: '101A194B4341C',
  })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({
    description: 'Numero Inicial',
    example: 1,
  })
  @IsInt()
  @Min(1)
  numeroInicial: number;

  @ApiProperty({
    description: 'Numero Final',
    example: 1000,
  })
  @IsInt()
  @Min(1)
  numeroFinal: number;
}
