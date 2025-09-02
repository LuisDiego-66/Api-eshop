import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TemplatesIds } from '../enums/templates.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMailDto {
  @ApiProperty({
    example: 'luisdiegoborja8@gmail.com',
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    example: 'name of the receiver',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Subject of the email',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 'Body of the email',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({
    example: 'admin@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  cc?: string;

  @ApiProperty({
    description: 'ID of the email template to use',
    enum: TemplatesIds,
    example: TemplatesIds.TEMPLATE_1,
  })
  @IsEnum(TemplatesIds)
  templateId: TemplatesIds;
}
