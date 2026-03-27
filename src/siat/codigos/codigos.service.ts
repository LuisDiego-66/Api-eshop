import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { SoapClient } from '../soap/soap.client';
import { SIAT_CONFIG } from '../soap/siat.config';

import { QueryDto } from '../common/dto/query.dto';

import { CUISResponse } from './interfaces/response-cuis.interface';

import { RequestsCodigosService } from './services/request-codigos.service';

import { Cuis } from './entities/cuis.entity';
import { Cufd } from './entities/cufd.entity';

@Injectable()
export class CodigosService {
  private readonly client: SoapClient;

  constructor(
    @InjectRepository(Cuis)
    private readonly cuisRepository: Repository<Cuis>,

    @InjectRepository(Cufd)
    private readonly cufdRepository: Repository<Cufd>,

    private readonly request: RequestsCodigosService,
  ) {
    this.client = new SoapClient(
      SIAT_CONFIG.wsdl.codigos,
      SIAT_CONFIG.TOKEN_SIAT,
    );
  }

  //? ============================================================================================== */
  //?                                      Get_CUIS                                                  */
  //? ============================================================================================== */

  async getCUIS(dto: QueryDto) {
    const now = new Date();

    const cuis = await this.cuisRepository.findOne({
      where: {
        fechaVigencia: MoreThan(now),
        codigoPuntoVenta: dto.codigoPuntoVenta,
        codigoSucursal: dto.codigoSucursal,
      },
      order: {
        fechaVigencia: 'DESC',
      },
    });

    if (cuis) {
      return cuis;
    }

    const responseCuis: CUISResponse = await this.request.CUIS({
      codigoPuntoVenta: dto.codigoPuntoVenta,
      codigoSucursal: dto.codigoSucursal,
    });

    const response = responseCuis.data.RespuestaCuis;

    if (response.transaccion) {
      const cuis = this.cuisRepository.create({
        codigoAmbiente: SIAT_CONFIG.ambiente,
        codigoModalidad: SIAT_CONFIG.modalidad,
        codigoPuntoVenta: dto.codigoPuntoVenta,
        codigoSistema: SIAT_CONFIG.codigoSistema,
        codigoSucursal: dto.codigoSucursal,
        nit: SIAT_CONFIG.nit,

        //? Response

        codigo: response.codigo,
        fechaVigencia: response.fechaVigencia,
        transaccion: response.transaccion,
      });
      return await this.cuisRepository.save(cuis);
    }

    throw new ConflictException(response);
  }

  //? ============================================================================================== */
  //?                                  Get_All_CUIS                                                  */
  //? ============================================================================================== */

  async getAllCUIS(): Promise<Cuis[]> {
    const CUIS = await this.cuisRepository.find();
    return CUIS;
  }

  //? ============================================================================================== */
  //?                                      Get_CUFD                                                  */
  //? ============================================================================================== */

  async getCUFD(dto: QueryDto): Promise<Cufd> {
    const now = new Date();
    const existing = await this.cufdRepository.findOne({
      where: {
        fechaVigencia: MoreThan(now),
        codigoPuntoVenta: dto.codigoPuntoVenta,
        codigoSucursal: dto.codigoSucursal,
      },
      order: {
        fechaVigencia: 'DESC',
      },
    });

    if (existing) {
      return existing;
    }

    const cuis = await this.getCUIS({
      codigoPuntoVenta: dto.codigoPuntoVenta,
      codigoSucursal: dto.codigoSucursal,
    });

    const responseCufd = await this.request.CUDF({
      codigoPuntoVenta: cuis.codigoPuntoVenta,
      codigoSucursal: dto.codigoSucursal,
      cuis: cuis.codigo,
    });

    const response = responseCufd.data.RespuestaCufd;

    if (response.transaccion) {
      const cufd = this.cufdRepository.create({
        codigoAmbiente: SIAT_CONFIG.ambiente,
        codigoModalidad: SIAT_CONFIG.modalidad,
        codigoPuntoVenta: dto.codigoPuntoVenta,
        codigoSistema: SIAT_CONFIG.codigoSistema,
        codigoSucursal: dto.codigoSucursal,
        codigoCuis: cuis.codigo,
        nit: SIAT_CONFIG.nit,

        //? Response

        codigo: response.codigo,
        codigoControl: response.codigoControl,
        fechaVigencia: response.fechaVigencia,
        transaccion: response.transaccion,
        direccion: response.direccion,
        cuis,
      });
      return await this.cufdRepository.save(cufd);
    }

    throw new ConflictException(response);
  }

  //? ============================================================================================== */
  //?                                  Get_All_CUFD                                                  */
  //? ============================================================================================== */

  async getAllCUFD(): Promise<Cufd[]> {
    const CUfd = await this.cufdRepository.find();
    return CUfd;
  }
}
