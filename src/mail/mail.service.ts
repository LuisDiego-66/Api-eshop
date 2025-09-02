import { Injectable } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';
import { SendGridClient } from './providers/sendgrid-client';

import { envs } from 'src/config/environments/environments';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  constructor(private readonly sendGridClient: SendGridClient) {}

  async sendEmail(sendMailDto: SendMailDto) {
    const mail: MailDataRequired = {
      to: sendMailDto.to,
      from: envs.SENDGRID_SENDER, //! Approved sender ID in Sendgrid
      subject: 'Test email',
      html: sendMailDto.body, // HTML content
      //content: [{ type: 'text/plain', value: sendMailDto.body }],
    };
    await this.sendGridClient.send(mail);
  }

  async sendEmailWithTemplate(sendMailDto: SendMailDto) {
    const mail: MailDataRequired = {
      to: sendMailDto.to,
      //cc: 'example@mail.com',
      from: envs.SENDGRID_SENDER,
      subject: sendMailDto.subject,
      templateId: sendMailDto.templateId,
      dynamicTemplateData: {
        name: sendMailDto.name, // variabes usadas en el template {{name}} y {{body}}
      },
    };
    await this.sendGridClient.send(mail);
  }
}
