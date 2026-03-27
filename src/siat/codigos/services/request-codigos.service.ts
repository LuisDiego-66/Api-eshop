import { Injectable } from '@nestjs/common';

import { SoapClient } from '../../soap/soap.client';
import { SIAT_CONFIG } from '../../soap/siat.config';

@Injectable()
export class RequestsCodigosService {
  private readonly client: SoapClient;

  constructor() {
    this.client = new SoapClient(
      SIAT_CONFIG.wsdl.codigos,
      SIAT_CONFIG.TOKEN_SIAT,
    );
  }

  //? ============================================================================================== */
  //?                                          CUIS                                                  */
  //? ============================================================================================== */

  async CUIS(data: {
    codigoPuntoVenta: number;
    codigoSucursal: number;
  }): Promise<any> {
    try {
      const response = await this.client.call('cuis', {
        SolicitudCuis: {
          codigoAmbiente: SIAT_CONFIG.ambiente,
          codigoModalidad: SIAT_CONFIG.modalidad,
          codigoPuntoVenta: data.codigoPuntoVenta,
          codigoSistema: SIAT_CONFIG.codigoSistema,
          codigoSucursal: data.codigoSucursal,
          nit: SIAT_CONFIG.nit,
        },
      });

      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: error,
        timestamp: new Date().toISOString(),
      };
    }
  }

  //? ============================================================================================== */
  //?                                          CUFD                                                  */
  //? ============================================================================================== */

  async CUDF(data: {
    cuis: string;
    codigoPuntoVenta: number;
    codigoSucursal: number;
  }): Promise<any> {
    try {
      const response = await this.client.call('cufd', {
        SolicitudCufd: {
          codigoAmbiente: SIAT_CONFIG.ambiente,
          codigoModalidad: SIAT_CONFIG.modalidad,
          codigoPuntoVenta: data.codigoPuntoVenta,
          codigoSistema: SIAT_CONFIG.codigoSistema,
          codigoSucursal: data.codigoSucursal,
          nit: SIAT_CONFIG.nit,
          cuis: data.cuis,
        },
      });

      return {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: error,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
