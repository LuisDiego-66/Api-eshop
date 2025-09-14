import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { HttpService } from './http/http.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, HttpService],
})
export class PaymentsModule {}
