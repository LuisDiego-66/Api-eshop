import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUrl } from 'class-validator';

export class DeleteMultimediaDto {
  @ApiProperty({
    description: 'Array de URLs a eliminar',
    example: [
      'http://localhost:3000/api/files/product/imagen1.jpeg',
      'http://localhost:3000/api/files/product/imagen2.jpeg',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  //@IsUrl(/* { require_protocol: true }, */ { each: true })
  secureUrl: string[];
}
