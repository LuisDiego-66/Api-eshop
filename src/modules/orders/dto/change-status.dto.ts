import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ChangeStatusDto {
  @ApiPropertyOptional({
    description: 'DHL Code',
    example: 'asd-123',
  })
  @IsOptional()
  @IsString()
  dhl_code?: string;
}
