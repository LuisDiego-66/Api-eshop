import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { envs } from 'src/config/environments/environments';
import { QrDataDto } from '../dto/qrData.dto';

@Injectable()
export class HttpService {
  private axios: ReturnType<typeof axios.create>;
  private urlBase = envs.URL_BASE_BNB;

  constructor() {
    this.axios = axios.create({
      baseURL: this.urlBase,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  //------------------------------------------------------------------------------- GetToken

  Authentication = () => {
    return this.axios.post('/ClientAuthentication.API/api/v1/auth/token', {
      accountId: envs.ACCOUNT_ID,
      authorizationId: envs.AUTHORIZATION_ID,
    });
  };

  //------------------------------------------------------------------------------- GetQR

  GenerateQr = (token: string, payload: QrDataDto) => {
    return this.axios.post(
      '/QRSimple.API/api/v1/main/getQRWithImageAsync',

      {
        currency: 'BOB',
        gloss: payload.gloss,
        amount: payload.amount,
        singleUse: true,
        expirationDate: '2026-06-15',
        additionalData: payload.additionalData,
        destinationAccountId: 1,
      },

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  };

  //------------------------------------------------------------------------------- GetQRStatus

  QrStatus = (token: string, qrId: string) => {
    return this.axios.post('/QRSimple.API/api/v1/main/getQRStatusAsync', qrId, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
}
