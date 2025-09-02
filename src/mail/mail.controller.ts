import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SendMailDto } from './dto/send-mail.dto';

import { MailService } from './mail.service';

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
