import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { QueryDto } from '../common/dto/query.dto';
import { CierrePuntoVentaDto, RegistroPuntoVentaDto } from './dto';

import { ResponsePuntoVenta } from './interfaces/response-punto-venta.interface';
import { ResponseCierrePuntoVenta } from './interfaces/response-cierre-punto-venta.interface';

import { CodigosService } from '../codigos/codigos.service';
import { RequestsOperacionesService } from './services/requests-operaciones.service';

import { PuntoVenta } from './entities/punto-venta.entity';

@Injectable()
export class PuntosVentaService {
  constructor(
    @InjectRepository(PuntoVenta)
    private readonly puntoVentaRepository: Repository<PuntoVenta>,

    private readonly request: RequestsOperacionesService,
    private readonly codigosService: CodigosService,
  ) {}

  //? ============================================================================================== */
  //?                                      Registro                                                  */
  //? ============================================================================================== */

  async registroPuntoVenta(dto: RegistroPuntoVentaDto, query: QueryDto) {
    const { cufd } = await this.getCodigos({
      codigoPuntoVenta: query.codigoPuntoVenta,
      codigoSucursal: query.codigoSucursal,
    });

    const puntoVentaResponse: ResponsePuntoVenta =
      await this.request.registroPuntoVenta({
        codigoAmbiente: cufd.codigoAmbiente,
        codigoModalidad: cufd.codigoModalidad,
        codigoSistema: cufd.codigoSistema,
        codigoSucursal: cufd.codigoSucursal,
        codigoTipoPuntoVenta: dto.codigoTipoPuntoVenta,
        codigoCuis: cufd.codigoCuis,
        descripcion: dto.descripcion,
        nit: cufd.nit,
        nombrePuntoVenta: dto.nombrePuntoVenta,
      });

    const response = puntoVentaResponse.data.RespuestaRegistroPuntoVenta;

    if (response.transaccion) {
      const puntoVenta = this.puntoVentaRepository.create({
        codigoAmbiente: cufd.codigoAmbiente,
        codigoModalidad: cufd.codigoModalidad,
        codigoSistema: cufd.codigoSistema,
        codigoSucursal: cufd.codigoSucursal,
        codigoTipoPuntoVenta: dto.codigoTipoPuntoVenta,
        codigoCuis: cufd.codigoCuis,
        descripcion: dto.descripcion,
        nit: cufd.nit,
        nombrePuntoVenta: dto.nombrePuntoVenta,

        //? Response

        codigoPuntoVenta: response.codigoPuntoVenta,
        transaccion: response.transaccion,
        fechaRespuesta: puntoVentaResponse.timestamp,
      });
      await this.puntoVentaRepository.save(puntoVenta);
      return puntoVenta;
    }
    return response;
  }

  //? ============================================================================================== */
  //?                                       FindAll                                                  */
  //? ============================================================================================== */

  async findAll() {
    return await this.puntoVentaRepository.find({});
  }

  //? ============================================================================================== */
  //?                                      Consulta                                                  */
  //? ============================================================================================== */

  async consultaPuntoVenta(query: QueryDto) {
    const { cufd } = await this.getCodigos({
      codigoPuntoVenta: query.codigoPuntoVenta,
      codigoSucursal: query.codigoSucursal,
    });

    return await this.request.consultaPuntoVenta({
      codigoAmbiente: cufd.codigoAmbiente,
      codigoSistema: cufd.codigoSistema,
      codigoSucursal: cufd.codigoSucursal,
      codigoCuis: cufd.codigoCuis,
      nit: cufd.nit,
    });
  }

  //? ============================================================================================== */
  //?                                        Cierre                                                  */
  //? ============================================================================================== */

  async cierrePuntoVenta(dto: CierrePuntoVentaDto, query: QueryDto) {
    const { cufd } = await this.getCodigos({
      codigoPuntoVenta: query.codigoPuntoVenta,
      codigoSucursal: query.codigoSucursal,
    });

    const cierrePuntoVentaResponse: ResponseCierrePuntoVenta =
      await this.request.cierrePuntoVenta({
        codigoAmbiente: cufd.codigoAmbiente,
        codigoPuntoVenta: dto.codigoPuntoVenta,
        codigoSistema: cufd.codigoSistema,
        codigoSucursal: cufd.codigoSucursal,
        codigoCuis: cufd.codigoCuis,
        nit: cufd.nit,
      });

    const response = cierrePuntoVentaResponse.data.RespuestaCierrePuntoVenta;

    if (response.transaccion) {
      const puntoVenta = await this.puntoVentaRepository.findOne({
        where: { codigoPuntoVenta: response.codigoPuntoVenta },
      });

      if (puntoVenta) await this.puntoVentaRepository.softRemove(puntoVenta);
    }
    return response;
  }

  //? ============================================================================================== */
  //?                                   Get_Codigos                                                  */
  //? ============================================================================================== */

  private async getCodigos(data: {
    codigoPuntoVenta: number;
    codigoSucursal: number;
  }) {
    const cufd = await this.codigosService.getCUFD({
      codigoPuntoVenta: data.codigoPuntoVenta,
      codigoSucursal: data.codigoSucursal,
    });

    return { cufd };
  }
}
