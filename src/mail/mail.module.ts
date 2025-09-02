import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { SendGridClient } from './providers/sendgrid-client';

@Module({
  controllers: [MailController],
  providers: [MailService, SendGridClient],
})
export class MailModule {}
