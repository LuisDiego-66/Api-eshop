// sendgrid-client.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';
import * as SendGrid from '@sendgrid/mail';

import { envs } from 'src/config/environments/environments';

@Injectable()
export class SendGridClient {
  private readonly logger = new Logger(SendGridClient.name);

  constructor() {
    SendGrid.setApiKey(envs.SENDGRID_API_KEY);
  }

  async send(mail: MailDataRequired): Promise<void> {
    try {
      await SendGrid.send(mail);
      this.logger.log(`Email sent to ${mail.to as string}`);
    } catch (error) {
      this.logger.error('Error sending email: ', error);
      throw error;
    }
  }
}
