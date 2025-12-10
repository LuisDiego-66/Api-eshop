import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';

import { GenerateQRDto } from './dto/generate-qr.dto';

import { Response } from 'express';

import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('generate-qr')
  generateQr(@Body() generateQrDto: GenerateQRDto) {
    return this.paymentsService.generateQr(generateQrDto);
  }

  @Post('qr/callback')
  qrCallback(@Body() body: any, @Res() res: Response) {
    console.log('QR Callback received:', body);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Payment completed successfully',
    });
  }
}

/* 
QR Callback received: {
QRId: '23973669',
Gloss: 'Test de QR',
sourceBankId: 16,
originName: 'LUIS',
VoucherId: '0',
TransactionDateTime: '09/12/2025 16:00:54',
additionalData: '1',
amount: 0.1,
currencyId: 1
}




*/
