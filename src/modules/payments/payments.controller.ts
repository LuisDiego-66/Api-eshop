import { Controller, Get, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /*   @Post('generate-qr')
  generateQr() {
    return this.paymentsService.generateQr();
  } */

  @Post('qr/callback')
  generateQr() {
    return 'QR callback';
  }
}
