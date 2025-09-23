import { Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /*   @Post('generate-qr')
  generateQr() {
    return this.paymentsService.generateQr();
  } */
}
