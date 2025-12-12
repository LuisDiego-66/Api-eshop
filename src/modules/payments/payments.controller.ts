import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { GenerateQRDto } from './dto/generate-qr.dto';

import { BNBPayload } from './interfaces/bnb-payload.interface';

import { PaymentsService } from './payments.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  //? ============================================================================================== */
  //?                                   Generate_QR                                                  */
  //? ============================================================================================== */

  @Post('generate-qr')
  generateQr(@Body() generateQrDto: GenerateQRDto) {
    return this.paymentsService.generateQr(generateQrDto);
  }

  //? ============================================================================================== */
  //?                                      CallBack                                                  */
  //? ============================================================================================== */

  @Post('qr/callback')
  @HttpCode(200)
  qrCallback(@Body() body: BNBPayload) {
    this.paymentsService.confirmOrder(body);

    return {
      success: true,
      message: 'OK',
    };
  }

  //? ============================================================================================== */
  //?                                Verify_payment                                                  */
  //? ============================================================================================== */

  @Get('verify/:id')
  verifyPayment(@Param('id', ParseIntPipe) orderId: number) {
    return this.paymentsService.verifyPayment(orderId);
  }
}

/* 
QR Callback received: {
QRId: '24020824',
Gloss: 'Prueba QR',
sourceBankId: 16,
originName: 'LUIS',
VoucherId: '0',
TransactionDateTime: '10/12/2025 15:14:59',
additionalData: 'prueba',
amount: 0.1,
currencyId: 1
}
*/
