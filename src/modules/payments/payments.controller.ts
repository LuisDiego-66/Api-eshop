import { Body, Controller, Get, Post } from '@nestjs/common';

import { GenerateQRDto } from './dto/generate-qr.dto';

import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /* @Post('generate-qr')
  generateQr(@Body() generateQrDto: GenerateQRDto) {
    return this.paymentsService.generateQr(generateQrDto);
  } */

  @Post('qr/callback')
  qrCallback() {
    return 'QR callback';
  }
}
