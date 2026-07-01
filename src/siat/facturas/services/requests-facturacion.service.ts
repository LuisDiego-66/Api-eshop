import { Injectable } from '@nestjs/common';
import { SoapClient } from '../../soap/soap.client';
import { SIAT_CONFIG } from '../../soap/siat.config';

@Injectable()
export class RequestsFacturacionService {
  private readonly client: SoapClient;

  constructor() {
    this.client = new SoapClient(
      SIAT_CONFIG.wsdl.facturaCompraVenta,
      SIAT_CONFIG.TOKEN_SIAT,
    );
  }

  //? ============================================================================================== */
  //?                           Verificar_Comunicacion                                               */
  //? ============================================================================================== */

  async verificarComunicacion(): Promise<boolean> {
    try {
      await this.client.call('verificarComunicacion', {});
      return true;
    } catch {
      return false;
    }
  }

  //? ============================================================================================== */
  //?                             Recepcion_Factura                                                  */
  //? ============================================================================================== */

  async recepcionFactura(data: {
    codigoAmbiente: number;
    codigoDocumentoSector: number;
    codigoEmision: number;
    codigoModalidad: number;
    codigoPuntoVenta: number;
    codigoSistema: string;
    codigoSucursal: number;
    codigoCufd: string;
    codigoCuis: string;
    nit: number;
    tipoFacturaDocumento: number;
    archivo: string;
    fechaEnvio: string;
    hashArchivo: string;
  }): Promise<any> {
    try {
      const response = await this.client.call('recepcionFactura', {
        SolicitudServicioRecepcionFactura: {
          codigoAmbiente: data.codigoAmbiente,
          codigoDocumentoSector: data.codigoDocumentoSector,
          codigoEmision: data.codigoEmision,
          codigoModalidad: data.codigoModalidad,
          codigoPuntoVenta: data.codigoPuntoVenta,
          codigoSistema: data.codigoSistema,
          codigoSucursal: data.codigoSucursal,
          cufd: data.codigoCufd,
          cuis: data.codigoCuis,
          nit: data.nit,
          tipoFacturaDocumento: data.tipoFacturaDocumento,
          archivo: data.archivo,
          fechaEnvio: data.fechaEnvio,
          hashArchivo: data.hashArchivo,
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
  //?                     Verificacion_Estado_Factura                                                */
  //? ============================================================================================== */

  async verificacionEstadoFactura(data: {
    codigoAmbiente: number;
    codigoDocumentoSector: number;
    codigoEmision: number;
    codigoModalidad: number;
    codigoPuntoVenta: number;
    codigoSistema: string;
    codigoSucursal: number;
    codigoCufd: string;
    codigoCuis: string;
    nit: number;
    tipoFacturaDocumento: number;
    cuf: string;
  }): Promise<any> {
    try {
      const response = await this.client.call('verificacionEstadoFactura', {
        SolicitudServicioVerificacionEstadoFactura: {
          codigoAmbiente: data.codigoAmbiente,
          codigoDocumentoSector: data.codigoDocumentoSector,
          codigoEmision: data.codigoEmision,
          codigoModalidad: data.codigoModalidad,
          codigoPuntoVenta: data.codigoPuntoVenta,
          codigoSistema: data.codigoSistema,
          codigoSucursal: data.codigoSucursal,
          cufd: data.codigoCufd,
          cuis: data.codigoCuis,
          nit: data.nit,
          tipoFacturaDocumento: data.tipoFacturaDocumento,
          cuf: data.cuf,
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
  //?                             Anulacion_Factura                                                  */
  //? ============================================================================================== */

  async anulacionFactura(data: {
    codigoAmbiente: number;
    codigoDocumentoSector: number;
    codigoEmision: number;
    codigoModalidad: number;
    codigoPuntoVenta: number;
    codigoSistema: string;
    codigoSucursal: number;
    codigoCufd: string;
    codigoCuis: string;
    nit: number;
    tipoFacturaDocumento: number;
    codigoMotivo: number;
    cuf: string;
  }): Promise<any> {
    try {
      const response = await this.client.call('anulacionFactura', {
        SolicitudServicioAnulacionFactura: {
          codigoAmbiente: data.codigoAmbiente,
          codigoDocumentoSector: data.codigoDocumentoSector,
          codigoEmision: data.codigoEmision,
          codigoModalidad: data.codigoModalidad,
          codigoPuntoVenta: data.codigoPuntoVenta,
          codigoSistema: data.codigoSistema,
          codigoSucursal: data.codigoSucursal,
          cufd: data.codigoCufd,
          cuis: data.codigoCuis,
          nit: data.nit,
          tipoFacturaDocumento: data.tipoFacturaDocumento,
          codigoMotivo: data.codigoMotivo,
          cuf: data.cuf,
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
  //?                   Reversion_Anulacion_Factura                                                  */
  //? ============================================================================================== */

  async reversionAnulacionFactura(data: {
    codigoAmbiente: number;
    codigoDocumentoSector: number;
    codigoEmision: number;
    codigoModalidad: number;
    codigoPuntoVenta: number;
    codigoSistema: string;
    codigoSucursal: number;
    codigoCufd: string;
    codigoCuis: string;
    nit: number;
    tipoFacturaDocumento: number;
    cuf: string;
  }): Promise<any> {
    try {
      const response = await this.client.call('reversionAnulacionFactura', {
        SolicitudServicioReversionAnulacionFactura: {
          codigoAmbiente: data.codigoAmbiente,
          codigoDocumentoSector: data.codigoDocumentoSector,
          codigoEmision: data.codigoEmision,
          codigoModalidad: data.codigoModalidad,
          codigoPuntoVenta: data.codigoPuntoVenta,
          codigoSistema: data.codigoSistema,
          codigoSucursal: data.codigoSucursal,
          cufd: data.codigoCufd,
          cuis: data.codigoCuis,
          nit: data.nit,
          tipoFacturaDocumento: data.tipoFacturaDocumento,
          cuf: data.cuf,
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
  //?                     Recepcion_Paquete_Factura                                                  */
  //? ============================================================================================== */

  async recepcionPaqueteFactura(data: {
    codigoAmbiente: number;
    codigoDocumentoSector: number;
    codigoEmision: number;
    codigoModalidad: number;
    codigoPuntoVenta: number;
    codigoSistema: string;
    codigoSucursal: number;
    codigoCufd: string;
    codigoCuis: string;
    nit: number;
    tipoFacturaDocumento: number;
    archivo: string;
    fechaEnvio: string;
    hashArchivo: string;
    cafc?: string; //! opcional
    cantidadFacturas: number;
    codigoEvento: number;
  }): Promise<any> {
    try {
      const response = await this.client.call('recepcionPaqueteFactura', {
        SolicitudServicioRecepcionPaquete: {
          codigoAmbiente: data.codigoAmbiente,
          codigoDocumentoSector: data.codigoDocumentoSector,
          codigoEmision: data.codigoEmision,
          codigoModalidad: data.codigoModalidad,
          codigoPuntoVenta: data.codigoPuntoVenta,
          codigoSistema: data.codigoSistema,
          codigoSucursal: data.codigoSucursal,
          cufd: data.codigoCufd,
          cuis: data.codigoCuis,
          nit: data.nit,
          tipoFacturaDocumento: data.tipoFacturaDocumento,
          archivo: data.archivo,
          fechaEnvio: data.fechaEnvio,
          hashArchivo: data.hashArchivo,
          cafc: data.cafc,
          cantidadFacturas: data.cantidadFacturas,
          codigoEvento: data.codigoEvento,
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
  //?          Validacion_Recepcion_Paquete_Factura                                                  */
  //? ============================================================================================== */

  async validacionRecepcionPaqueteFactura(data: {
    codigoAmbiente: number;
    codigoDocumentoSector: number;
    codigoEmision: number;
    codigoModalidad: number;
    codigoPuntoVenta: number;
    codigoSistema: string;
    codigoSucursal: number;
    codigoCufd: string;
    codigoCuis: string;
    nit: number;
    tipoFacturaDocumento: number;
    codigoRecepcion: string;
  }): Promise<any> {
    try {
      const response = await this.client.call(
        'validacionRecepcionPaqueteFactura',
        {
          SolicitudServicioValidacionRecepcionPaquete: {
            codigoAmbiente: data.codigoAmbiente,
            codigoDocumentoSector: data.codigoDocumentoSector,
            codigoEmision: data.codigoEmision,
            codigoModalidad: data.codigoModalidad,
            codigoPuntoVenta: data.codigoPuntoVenta,
            codigoSistema: data.codigoSistema,
            codigoSucursal: data.codigoSucursal,
            cufd: data.codigoCufd,
            cuis: data.codigoCuis,
            nit: data.nit,
            tipoFacturaDocumento: data.tipoFacturaDocumento,
            codigoRecepcion: data.codigoRecepcion,
          },
        },
      );

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
