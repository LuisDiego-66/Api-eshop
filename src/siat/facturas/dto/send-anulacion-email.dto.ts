import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsPositive, IsArray, ArrayMinSize } from 'class-validator';

export class SendAnulacionEmailDto {
  @ApiProperty({ example: 'cliente@empresa.com', description: 'Correo destino' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: [1, 2, 3], description: 'IDs de las facturas anuladas' })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  facturaIds: number[];
}
