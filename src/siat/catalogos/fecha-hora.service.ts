import { Injectable } from '@nestjs/common';

import { SoapClient } from '../soap/soap.client';
import { SIAT_CONFIG } from '../soap/siat.config';

import { ListasEnum } from './enums/listas.enum';

import { ResponseFechaHora } from './interfaces/response-fecha-hora.interface';

import { Cufd } from '../codigos/entities/cufd.entity';

@Injectable()
export class FechaHoraService {
  private readonly client: SoapClient;

  constructor() {
    this.client = new SoapClient(
      SIAT_CONFIG.wsdl.sincronizacion,
      SIAT_CONFIG.TOKEN_SIAT,
    );
  }

  async getFechaHora(cufd: Cufd) {
    const response: ResponseFechaHora = await this.client.call(
      ListasEnum.FechaHora,
      {
        SolicitudSincronizacion: {
          codigoAmbiente: cufd.codigoAmbiente,
          codigoPuntoVenta: cufd.codigoPuntoVenta,
          codigoSistema: cufd.codigoSistema,
          codigoSucursal: cufd.codigoSucursal,
          cuis: cufd.codigoCuis,
          nit: cufd.nit,
        },
      },
    );

    return response.RespuestaFechaHora;
  }
}
