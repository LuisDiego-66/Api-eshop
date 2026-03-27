import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { SIAT_CONFIG } from 'src/siat/soap/siat.config';

import { ListasEnum } from '../enums/listas.enum';
import { ParametricasEnum } from '../enums/parametricas.enum';

import { QueryDto } from '../../common/dto/query.dto';

import { CodigosService } from 'src/siat/codigos/codigos.service';
import { RequestsCatalogosService } from './request-catalogos.service';

import { SiatLista } from '../entities/lista.entity';
import { SiatSync } from '../entities/siat_sync.entity';
import { Cuis } from 'src/siat/codigos/entities/cuis.entity';
import { SiatParametrica } from '../entities/parametrica.entity';

@Injectable()
export class SincronizacionService {
  private arrayParametricasMetodos = [
    ParametricasEnum.EventosSignificativos,
    ParametricasEnum.MotivoAnulacion,
    ParametricasEnum.PaisOrigen,
    ParametricasEnum.TipoDocumentoIdentidad,
    ParametricasEnum.TipoDocumentoSector,
    ParametricasEnum.TipoEmision,
    ParametricasEnum.TipoHabitacion,
    ParametricasEnum.TipoMetodoPago,
    ParametricasEnum.TipoMoneda,
    ParametricasEnum.TipoPuntoVenta,
    ParametricasEnum.TiposFactura,
    ParametricasEnum.UnidadMedida,
  ];

  private arrayListasMetodos = [
    ListasEnum.Actividades,
    ListasEnum.ListaActividadesDocumentoSector,
    ListasEnum.ListaLeyendasFactura,
    ListasEnum.ListaMensajesServicios,
    ListasEnum.ListaProductosServicios,
  ];

  constructor(
    @InjectRepository(SiatSync)
    private readonly siatSyncRepository: Repository<SiatSync>,

    @InjectRepository(SiatParametrica)
    private readonly ParametricaRepository: Repository<SiatParametrica>,

    @InjectRepository(SiatLista)
    private readonly ListaRepository: Repository<SiatLista>,

    private readonly codigosService: CodigosService,

    private readonly requestService: RequestsCatalogosService,
  ) {}

  //? ============================================================================================== */
  //?                                Sincronizacion                                                  */
  //? ============================================================================================== */

  async sincronizacion(dto: QueryDto) {
    const cuis = await this.codigosService.getCUIS({
      codigoPuntoVenta: dto.codigoPuntoVenta,
      codigoSucursal: dto.codigoSucursal,
    });

    const startDay = new Date();
    startDay.setHours(0, 0, 0, 0);

    const endDay = new Date();
    endDay.setHours(23, 59, 59, 999);

    const existingSiatSync = await this.siatSyncRepository.findOne({
      where: {
        createdAt: Between(startDay, endDay),

        codigoPuntoVenta: dto.codigoPuntoVenta,
        codigoSucursal: dto.codigoSucursal,
      },
    });

    if (existingSiatSync) {
      return existingSiatSync;
    }

    //! para completar pruebas
    const newSiatSync = await this.createSiatSync({
      codigoAmbiente: SIAT_CONFIG.ambiente,
      codigoPuntoVenta: dto.codigoPuntoVenta,
      codigoSistema: SIAT_CONFIG.codigoSistema,
      codigoSucursal: dto.codigoSucursal,
      codigoCuis: cuis.codigo,
      nit: SIAT_CONFIG.nit,
      cuis,
    });

    await this.sincronizacionParametricas(
      cuis,
      dto.codigoPuntoVenta,
      dto.codigoSucursal,
      newSiatSync,
    );
    await this.sincronizacionListas(
      cuis,
      dto.codigoPuntoVenta,
      dto.codigoSucursal,
      newSiatSync,
    );
    return newSiatSync;
  }

  //? ============================================================================================== */
  //?                   Sincronizacion_Parametricas                                                  */
  //? ============================================================================================== */

  private async sincronizacionParametricas(
    cuis: Cuis,
    codigoPuntoVenta: number,
    codigoSucursal: number,
    siatSync?: SiatSync,
  ) {
    await Promise.all(
      this.arrayParametricasMetodos.map((metodo) =>
        this.getParametricasFromSiat(
          cuis,
          metodo,
          codigoPuntoVenta,
          codigoSucursal,
          siatSync,
        ),
      ),
    );
  }

  //? ============================================================================================== */

  private async getParametricasFromSiat(
    cuis: Cuis,
    metodo: ParametricasEnum,
    codigoPuntoVenta: number,
    codigoSucursal: number,
    siatSync?: SiatSync,
  ) {
    const parametrica = await this.requestService.requestParametrica_FromSIAT(
      cuis.codigo,
      metodo,
      codigoPuntoVenta,
      codigoSucursal,
    );

    if (siatSync) {
      await this.saveParametrica(
        siatSync,
        parametrica.RespuestaListaParametricas.listaCodigos,
        metodo,
      );
    }
  }

  //? ============================================================================================== */

  private async saveParametrica(
    siatSync: SiatSync,
    payload: any,
    metodo: ParametricasEnum,
  ) {
    const newLista = this.ParametricaRepository.create({
      methodName: metodo,
      payload,
      siatsync: siatSync,
    });
    await this.ParametricaRepository.save(newLista);
  }

  //? ============================================================================================== */
  //?                         Sincronizacion_Listas                                                  */
  //? ============================================================================================== */

  private async sincronizacionListas(
    cuis: Cuis,
    codigoPuntoVenta: number,
    codigoSucursal: number,
    siatSync?: SiatSync,
  ) {
    await Promise.all(
      this.arrayListasMetodos.map((metodo) =>
        this.getListasFromSiat(
          cuis,
          metodo,
          codigoPuntoVenta,
          codigoSucursal,
          siatSync,
        ),
      ),
    );
  }

  //? ============================================================================================== */

  private async getListasFromSiat(
    cuis: Cuis,
    metodo: ListasEnum,
    codigoPuntoVenta: number,
    codigoSucursal: number,
    siatSync?: SiatSync,
  ) {
    let lista: any = {};

    switch (metodo) {
      case ListasEnum.Actividades:
        lista = await this.requestService.actividades_RequestFromSIAT(
          cuis.codigo,
          codigoPuntoVenta,
          codigoSucursal,
        );
        break;

      case ListasEnum.ListaActividadesDocumentoSector:
        lista =
          await this.requestService.actividadesDocumentoSector_RequestFromSIAT(
            cuis.codigo,
            codigoPuntoVenta,
            codigoSucursal,
          );
        break;

      case ListasEnum.ListaLeyendasFactura:
        lista = await this.requestService.leyendas_RequestFromSIAT(
          cuis.codigo,
          codigoPuntoVenta,
          codigoSucursal,
        );
        break;

      case ListasEnum.ListaMensajesServicios:
        lista = await this.requestService.mensajesServicios_RequestFromSIAT(
          cuis.codigo,
          codigoPuntoVenta,
          codigoSucursal,
        );
        break;

      case ListasEnum.ListaProductosServicios:
        lista = await this.requestService.productosServicios_RequestFromSIAT(
          cuis.codigo,
          codigoPuntoVenta,
          codigoSucursal,
        );
        break;
    }

    if (siatSync) {
      await this.saveLista(siatSync, lista, metodo);
    }
  }

  //? ============================================================================================== */

  private async saveLista(
    siatSync: SiatSync,
    payload: any,
    method: ListasEnum,
  ) {
    const newLista = this.ListaRepository.create({
      methodName: method,
      payload,
      siatsync: siatSync,
    });
    await this.ListaRepository.save(newLista);
  }

  //? ============================================================================================== */
  //?                              Create_Siat_Sync                                                  */
  //? ============================================================================================== */

  private async createSiatSync(data: {
    codigoAmbiente: number;
    codigoPuntoVenta: number;
    codigoSistema: string;
    codigoSucursal: number;
    codigoCuis: string;
    nit: number;
    cuis: Cuis;
  }) {
    const siatSync = this.siatSyncRepository.create({
      codigoAmbiente: data.codigoAmbiente,
      codigoPuntoVenta: data.codigoPuntoVenta,
      codigoSistema: data.codigoSistema,
      codigoSucursal: data.codigoSucursal,
      codigoCuis: data.codigoCuis,
      nit: data.nit,
      cuis: data.cuis,
    });
    return await this.siatSyncRepository.save(siatSync);
  }
}
