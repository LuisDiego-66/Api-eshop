import { Injectable } from '@nestjs/common';

import { HttpService } from './http/http.service';

@Injectable()
export class PaymentsService {
  constructor(private httpService: HttpService) {}

  //? ============================================================================================== */
  //?                                   Generate QR                                                  */
  //? ============================================================================================== */

  async generateQr(data?: { additionalData: string; amount: number }) {
    const { message: token } = await this.authentication();

    return await this.httpService
      .GenerateQr(token, {
        currency: 'BOB',
        gloss: 'Test de QR',
        amount: 12,
        singleUse: true,
        expirationDate: '2025-09-22',
        additionalData: 'datita',
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
