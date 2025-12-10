import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';

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
  @HttpCode(200)
  qrCallback(@Body() body: any) {
    console.log('QR Callback received:', body);

    return {
      success: true,
      message: 'OK',
    };
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
