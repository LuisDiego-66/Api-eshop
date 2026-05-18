import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  RegistroEventoSignificativoDto,
  ConsultaEventoSignificativoDto,
} from './dto';
import { QueryDto } from '../common/dto/query.dto';

import {
  ResponseEventoSiginificativo,
  RespuestaListaEventos,
} from './interfaces/response-evento-significativo.interface';

import { CodigosService } from '../codigos/codigos.service';
import { RequestsOperacionesService } from './services/requests-operaciones.service';

import { EventoSignificativo } from './entities/evento-significativo.entity';

@Injectable()
export class EventosSignificativosService {
  constructor(
    @InjectRepository(EventoSignificativo)
    private readonly eventoSignificativoRepository: Repository<EventoSignificativo>,
    private readonly request: RequestsOperacionesService,
    private readonly codigosService: CodigosService,
  ) {}

  //? ============================================================================================== */
  //?                                      Registro                                                  */
  //? ============================================================================================== */

  async registroEventoSignificativo(
    dto: RegistroEventoSignificativoDto,
    query: QueryDto,
  ) {
    const { cufd } = await this.getCodigos({
      codigoPuntoVenta: query.codigoPuntoVenta,
      codigoSucursal: query.codigoSucursal,
    });

    const eventoSignificativoResponse: ResponseEventoSiginificativo =
      await this.request.registroEventoSignificativo({
        codigoAmbiente: cufd.codigoAmbiente,
        codigoMotivoEvento: dto.codigoMotivoEvento,
        codigoPuntoVenta: cufd.codigoPuntoVenta,
        codigoSistema: cufd.codigoSistema,
        codigoSucursal: cufd.codigoSucursal,
        codigoCufd: cufd.codigo,
        cufdEvento: dto.cufdEvento,
        codigoCuis: cufd.codigoCuis,
        descripcion: dto.descripcion,
        fechaHoraFinEvento: dto.fechaHoraFinEvento,
        fechaHoraInicioEvento: dto.fechaHoraInicioEvento,
        nit: cufd.nit,
      });

    // --------------------------------------------------
    // Respuesta principal o fallback
    // --------------------------------------------------

    const response = eventoSignificativoResponse.data.RespuestaListaEventos;

    // --------------------------------------------------
    // Transacción exitosa
    // --------------------------------------------------

    if (response.transaccion) {
      const eventoSignificativo = this.eventoSignificativoRepository.create({
        codigoAmbiente: cufd.codigoAmbiente,
        codigoMotivoEvento: dto.codigoMotivoEvento,
        codigoPuntoVenta: cufd.codigoPuntoVenta,
        codigoSistema: cufd.codigoSistema,
        codigoSucursal: cufd.codigoSucursal,
        codigoCufd: cufd.codigo,
        cufdEvento: dto.cufdEvento,
        codigoCuis: cufd.codigoCuis,
        descripcion: dto.descripcion,
        fechaHoraFinEvento: dto.fechaHoraFinEvento,
        fechaHoraInicioEvento: dto.fechaHoraInicioEvento,
        nit: cufd.nit,

        //? Response

        codigoRecepcionEventoSignificativo:
          response.codigoRecepcionEventoSignificativo,
        fechaRespuesta: eventoSignificativoResponse.timestamp,
        transaccion: response.transaccion,
      });
      await this.eventoSignificativoRepository.save(eventoSignificativo);
      return eventoSignificativo;
    }

    return response;
  }

  //? ============================================================================================== */
  //?                                       FindAll                                                  */
  //? ============================================================================================== */

  async findAll() {
    return await this.eventoSignificativoRepository.find({});
  }

  //? ============================================================================================== */
  //?                                      Consulta                                                  */
  //? ============================================================================================== */

  async consultaEventoSignificativo(
    dto: ConsultaEventoSignificativoDto,
    query: QueryDto,
  ) {
    const { cufd } = await this.getCodigos({
      codigoPuntoVenta: query.codigoPuntoVenta,
      codigoSucursal: query.codigoSucursal,
    });

    return await this.request.consultaEventoSignificativo({
      codigoAmbiente: cufd.codigoAmbiente,
      codigoPuntoVenta: cufd.codigoPuntoVenta,
      codigoSistema: cufd.codigoSistema,
      codigoSucursal: cufd.codigoSucursal,
      codigoCufd: cufd.codigo,
      codigoCuis: cufd.codigoCuis,
      nit: cufd.nit,
      fechaEvento: dto.fechaEvento,
    });
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
