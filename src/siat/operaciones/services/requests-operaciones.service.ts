import { Injectable } from '@nestjs/common';

import { SoapClient } from '../../soap/soap.client';
import { SIAT_CONFIG } from '../../soap/siat.config';

@Injectable()
export class RequestsOperacionesService {
  private readonly client: SoapClient;

  constructor() {
    this.client = new SoapClient(
      SIAT_CONFIG.wsdl.operaciones,
      SIAT_CONFIG.TOKEN_SIAT,
    );
  }

  //? ============================================================================================== */
  //?                              Registro_Eventos                                                  */
  //? ============================================================================================== */

  async registroEventoSignificativo(data: {
    codigoAmbiente: number;
    codigoMotivoEvento: number;
    codigoPuntoVenta: number;
    codigoSistema: string;
    codigoSucursal: number;
    codigoCufd: string;
    cufdEvento: string;
    codigoCuis: string;
    descripcion: string;
    fechaHoraFinEvento: string;
    fechaHoraInicioEvento: string;
    nit: number;
  }): Promise<any> {
    try {
      const response = await this.client.call('registroEventoSignificativo', {
        SolicitudEventoSignificativo: {
          codigoAmbiente: data.codigoAmbiente,
          codigoMotivoEvento: data.codigoMotivoEvento,
          codigoPuntoVenta: data.codigoPuntoVenta,
          codigoSistema: data.codigoSistema,
          codigoSucursal: data.codigoSucursal,
          cufd: data.codigoCufd,
          cufdEvento: data.cufdEvento,
          cuis: data.codigoCuis,
          descripcion: data.descripcion,
          fechaHoraFinEvento: data.fechaHoraFinEvento,
          fechaHoraInicioEvento: data.fechaHoraInicioEvento,
          nit: data.nit,
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
  //?                              Consulta_Eventos                                                  */
  //? ============================================================================================== */

  async consultaEventoSignificativo(data: {
    codigoAmbiente: number;
    codigoPuntoVenta: number;
    codigoSistema: string;
    codigoSucursal: number;
    codigoCufd: string;
    codigoCuis: string;
    fechaEvento: string;
    nit: number;
  }): Promise<any> {
    try {
      const response = await this.client.call('consultaEventoSignificativo', {
        SolicitudConsultaEvento: {
          codigoAmbiente: data.codigoAmbiente,
          codigoPuntoVenta: data.codigoPuntoVenta,
          codigoSistema: data.codigoSistema,
          codigoSucursal: data.codigoSucursal,
          cufd: data.codigoCufd,
          cuis: data.codigoCuis,
          fechaEvento: data.fechaEvento,
          nit: data.nit,
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
  //?                          Registro_PuntosVenta                                                  */
  //? ============================================================================================== */

  async registroPuntoVenta(data: {
    codigoAmbiente: number;
    codigoModalidad: number;
    codigoSistema: string;
    codigoSucursal: number;
    codigoTipoPuntoVenta: number;
    codigoCuis: string;
    descripcion: string;
    nit: number;
    nombrePuntoVenta: string;
  }): Promise<any> {
    try {
      const response = await this.client.call('registroPuntoVenta', {
        SolicitudRegistroPuntoVenta: {
          codigoAmbiente: data.codigoAmbiente,
          codigoModalidad: data.codigoModalidad,
          codigoSistema: data.codigoSistema,
          codigoSucursal: data.codigoSucursal,
          codigoTipoPuntoVenta: data.codigoTipoPuntoVenta,
          cuis: data.codigoCuis,
          descripcion: data.descripcion,
          nit: data.nit,
          nombrePuntoVenta: data.nombrePuntoVenta,
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
  //?                          Consulta_PuntosVenta                                                  */
  //? ============================================================================================== */

  async consultaPuntoVenta(data: {
    codigoAmbiente: number;
    codigoSistema: string;
    codigoSucursal: number;
    codigoCuis: string;
    nit: number;
  }): Promise<any> {
    try {
      const response = await this.client.call('consultaPuntoVenta', {
        SolicitudConsultaPuntoVenta: {
          codigoAmbiente: data.codigoAmbiente,
          codigoSistema: data.codigoSistema,
          codigoSucursal: data.codigoSucursal,
          cuis: data.codigoCuis,
          nit: data.nit,
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
  //?                            Cierre_PuntosVenta                                                  */
  //? ============================================================================================== */

  async cierrePuntoVenta(data: {
    codigoAmbiente: number;
    codigoPuntoVenta: number;
    codigoSistema: string;
    codigoSucursal: number;
    codigoCuis: string;
    nit: number;
  }): Promise<any> {
    try {
      const response = await this.client.call('cierrePuntoVenta', {
        SolicitudCierrePuntoVenta: {
          codigoAmbiente: data.codigoAmbiente,
          codigoPuntoVenta: data.codigoPuntoVenta,
          codigoSistema: data.codigoSistema,
          codigoSucursal: data.codigoSucursal,
          cuis: data.codigoCuis,
          nit: data.nit,
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
