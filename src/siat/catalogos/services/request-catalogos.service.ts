import { Injectable } from '@nestjs/common';

import { SoapClient } from '../../soap/soap.client';
import { SIAT_CONFIG } from '../../soap/siat.config';
import {
  ResponseParametrica,
  ResponseActividades,
  ResponseListaLeyendasFactura,
  ResponseListaMensajesServicios,
  ResponseListaProductosServicios,
  ResponseListaActividadesDocumentoSector,
} from '../interfaces';

import { ListasEnum } from '../enums/listas.enum';
import { ParametricasEnum } from '../enums/parametricas.enum';

@Injectable()
export class RequestsCatalogosService {
  private readonly client: SoapClient;

  constructor() {
    this.client = new SoapClient(
      SIAT_CONFIG.wsdl.sincronizacion,
      SIAT_CONFIG.TOKEN_SIAT,
    );
  }

  //? ============================================================================================== */
  //?                               RequestFromSIAT                                                  */
  //? ============================================================================================== */

  async requestParametrica_FromSIAT(
    cuis: string,
    metodo: ParametricasEnum,
    codigoPuntoVenta: number,
    codigoSucursal: number,
  ) {
    const response: ResponseParametrica = await this.client.call(metodo, {
      SolicitudSincronizacion: {
        codigoAmbiente: SIAT_CONFIG.ambiente,
        codigoPuntoVenta: codigoPuntoVenta,
        codigoSistema: SIAT_CONFIG.codigoSistema,
        codigoSucursal: codigoSucursal,
        cuis,
        nit: SIAT_CONFIG.nit,
      },
    });

    return response;
  }

  //? ============================================================================================== */
  //?                                   Actividades                                                  */
  //? ============================================================================================== */

  async actividades_RequestFromSIAT(
    cuis: string,
    codigoPuntoVenta: number,
    codigoSucursal: number,
  ) {
    const response: ResponseActividades = await this.client.call(
      ListasEnum.Actividades,
      {
        SolicitudSincronizacion: {
          codigoAmbiente: SIAT_CONFIG.ambiente,
          codigoPuntoVenta: codigoPuntoVenta,
          codigoSistema: SIAT_CONFIG.codigoSistema,
          codigoSucursal: codigoSucursal,
          cuis,
          nit: SIAT_CONFIG.nit,
        },
      },
    );

    return response;
  }

  //? ============================================================================================== */
  //?                  Actividades_Documento_Sector                                                  */
  //? ============================================================================================== */

  async actividadesDocumentoSector_RequestFromSIAT(
    cuis: string,
    codigoPuntoVenta: number,
    codigoSucursal: number,
  ) {
    const response: ResponseListaActividadesDocumentoSector =
      await this.client.call(ListasEnum.ListaActividadesDocumentoSector, {
        SolicitudSincronizacion: {
          codigoAmbiente: SIAT_CONFIG.ambiente,
          codigoPuntoVenta: codigoPuntoVenta,
          codigoSistema: SIAT_CONFIG.codigoSistema,
          codigoSucursal: codigoSucursal,
          cuis,
          nit: SIAT_CONFIG.nit,
        },
      });

    return response;
  }

  //? ============================================================================================== */
  //?                                      Leyendas                                                  */
  //? ============================================================================================== */

  async leyendas_RequestFromSIAT(
    cuis: string,
    codigoPuntoVenta: number,
    codigoSucursal: number,
  ) {
    const response: ResponseListaLeyendasFactura = await this.client.call(
      ListasEnum.ListaLeyendasFactura,
      {
        SolicitudSincronizacion: {
          codigoAmbiente: SIAT_CONFIG.ambiente,
          codigoPuntoVenta: codigoPuntoVenta,
          codigoSistema: SIAT_CONFIG.codigoSistema,
          codigoSucursal: codigoSucursal,
          cuis,
          nit: SIAT_CONFIG.nit,
        },
      },
    );

    return response;
  }

  //? ============================================================================================== */
  //?                            Mensajes_Servicios                                                  */
  //? ============================================================================================== */

  async mensajesServicios_RequestFromSIAT(
    cuis: string,
    codigoPuntoVenta: number,
    codigoSucursal: number,
  ) {
    const response: ResponseListaMensajesServicios = await this.client.call(
      ListasEnum.ListaMensajesServicios,
      {
        SolicitudSincronizacion: {
          codigoAmbiente: SIAT_CONFIG.ambiente,
          codigoPuntoVenta: codigoPuntoVenta,
          codigoSistema: SIAT_CONFIG.codigoSistema,
          codigoSucursal: codigoSucursal,
          cuis,
          nit: SIAT_CONFIG.nit,
        },
      },
    );

    return response;
  }

  //? ============================================================================================== */
  //?                           Productos_servicios                                                  */
  //? ============================================================================================== */

  async productosServicios_RequestFromSIAT(
    cuis: string,
    codigoPuntoVenta: number,
    codigoSucursal: number,
  ) {
    const response: ResponseListaProductosServicios = await this.client.call(
      ListasEnum.ListaProductosServicios,
      {
        SolicitudSincronizacion: {
          codigoAmbiente: SIAT_CONFIG.ambiente,
          codigoPuntoVenta: codigoPuntoVenta,
          codigoSistema: SIAT_CONFIG.codigoSistema,
          codigoSucursal: codigoSucursal,
          cuis,
          nit: SIAT_CONFIG.nit,
        },
      },
    );

    return response;
  }
}
