import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { SendMailDto } from './dto/send-mail.dto';

import { Auth } from 'src/auth/decorators';
import { Roles } from 'src/auth/enums';

import { MailService } from './mail.service';

@Auth(Roles.ADMIN)
@ApiBearerAuth('access-token')
@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly emailService: MailService) {}

  @Post('send-test-email')
  async sendEmail(@Body() sendEmailDTO: SendMailDto) {
    await this.emailService.sendEmail(sendEmailDTO);
  }

  @Post()
  async sendEmailWithTemplate(@Body() sendMailDto: SendMailDto) {
    await this.emailService.sendEmailWithTemplate(sendMailDto);
  }
}
