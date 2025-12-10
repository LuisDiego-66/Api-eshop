import { Injectable } from '@nestjs/common';

import { GenerateQRDto } from './dto/generate-qr.dto';

import { HttpService } from './http/http.service';

@Injectable()
export class PaymentsService {
  constructor(private httpService: HttpService) {}

  //? ============================================================================================== */
  //?                                   Generate QR                                                  */
  //? ============================================================================================== */

  async generateQr(generateQrDto: GenerateQRDto) {
    const { message: token } = await this.authentication();
    return await this.httpService
      .GenerateQr(token, {
        gloss: 'Test de QR',
        amount: 0.1,
        currency: 'BOB',
        singleUse: true,
        expirationDate: '2026-10-22',
        additionalData: generateQrDto.order.toString(),
        destinationAccountId: 1,
      })
      .then((res) => res.data)
      .catch((err) => err.response);
  }

  //? ============================================================================================== */
  //?                                     QR_Status                                                  */
  //? ============================================================================================== */

  async qrStatus(idQr: string) {
    const { message: token } = await this.authentication();
    return await this.httpService
      .QrStatus(token, idQr)
      .then((res) => res.data)
      .catch((err) => err.response);
  }

  //? ============================================================================================== */
  //?                                Authentication                                                  */
  //? ============================================================================================== */

  async authentication() {
    return await this.httpService
      .Authentication()
      .then((res) => res.data)
      .catch((err) => err.response);
  }
}
