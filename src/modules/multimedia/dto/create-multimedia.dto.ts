import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class CreateMultimediaDto {
  @ApiProperty({
    description: 'URL de la imagen de la variant',
    example:
      'http://localhost:3000/api/files/product/673a943a-36b5-46bf-b7bf-2d0fa0f5fdef.jpeg',
  })
  //@IsUrl({ require_protocol: true })
  @IsString()
  secureUrl: string;
}
