import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  RegistroEventoSignificativoDto,
  ConsultaEventoSignificativoDto,
} from './dto';
import { SettingsDto } from '../common/dto/settings.dto';

import {
  ResponseEventoSiginificativo,
  RespuestaListaEventos,
} from './interfaces/response-evento-significativo.interface';

import { CodigosService } from '../codigos/codigos.service';
import { RequestsOperacionesService } from './services/requests-operaciones.service';

import { EventoSignificativo } from './entities/evento-significativo.entity';
import { Cufd } from '../codigos/entities/cufd.entity';
import { parseBoliviaDateTime } from '../helpers/date.util';

@Injectable()
export class EventosSignificativosService {
  constructor(
    @InjectRepository(EventoSignificativo)
    private readonly eventoSignificativoRepository: Repository<EventoSignificativo>,
    @InjectRepository(Cufd)
    private readonly cufdRepository: Repository<Cufd>,
    private readonly request: RequestsOperacionesService,
    private readonly codigosService: CodigosService,
  ) {}

  //? ============================================================================================== */
  //?                                      Registro                                                  */
  //? ============================================================================================== */

  /*
  //! Versión anterior: recibía el CUFD del evento como cadena libre (dto.cufdEvento),
  //! sin validar que corresponda a un CUFD real de la sucursal/punto de venta.
  async registroEventoSignificativo(
    dto: RegistroEventoSignificativoDto,
    query: SettingsDto,
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
  */

  async registroEventoSignificativo(
    dto: RegistroEventoSignificativoDto,
    query: SettingsDto,
  ) {
    // Codigos "de sesión" para el sobre SOAP: siempre el CUFD vigente hoy.
    const { cufd } = await this.getCodigos({
      codigoPuntoVenta: query.codigoPuntoVenta,
      codigoSucursal: query.codigoSucursal,
    });

    // CUFD que realmente estaba vigente cuando ocurrió el evento (puede ser de días anteriores).
    const cufdEvento = await this.cufdRepository.findOne({
      where: {
        id: dto.cufdId,
        codigoPuntoVenta: query.codigoPuntoVenta,
        codigoSucursal: query.codigoSucursal,
      },
    });

    if (!cufdEvento) {
      throw new BadRequestException(
        'CUFD no encontrado para la sucursal y punto de venta indicados',
      );
    }

    // Las fechas del evento deben caer dentro del rango de vigencia del CUFD elegido.
    //! parseBoliviaDateTime: solo para esta comparación (instante absoluto correcto).
    //! El string naive original (dto.fechaHoraInicioEvento/FinEvento) sigue siendo
    //! lo que se envía a SIAT y se persiste, sin pasar por este parseo.
    const fechaHoraInicioEvento = parseBoliviaDateTime(
      dto.fechaHoraInicioEvento,
    );
    const fechaHoraFinEvento = parseBoliviaDateTime(dto.fechaHoraFinEvento);

    if (
      fechaHoraInicioEvento < cufdEvento.createdAt ||
      fechaHoraInicioEvento > cufdEvento.fechaVigencia ||
      fechaHoraFinEvento < cufdEvento.createdAt ||
      fechaHoraFinEvento > cufdEvento.fechaVigencia
    ) {
      throw new BadRequestException(
        'La fecha y hora del evento debe estar dentro del rango de vigencia del CUFD seleccionado',
      );
    }

    const eventoSignificativoResponse: ResponseEventoSiginificativo =
      await this.request.registroEventoSignificativo({
        codigoAmbiente: cufd.codigoAmbiente,
        codigoMotivoEvento: dto.codigoMotivoEvento,
        codigoPuntoVenta: cufd.codigoPuntoVenta,
        codigoSistema: cufd.codigoSistema,
        codigoSucursal: cufd.codigoSucursal,
        codigoCufd: cufd.codigo,
        cufdEvento: cufdEvento.codigo,
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
        cufd: cufdEvento,
        cufdEvento: cufdEvento.codigo,
        codigoCuis: cufd.codigoCuis,
        descripcion: dto.descripcion,
        //! Se persiste el instante absoluto ya corregido (parseBoliviaDateTime),
        //! no el string naive: Postgres interpreta un string sin offset según
        //! el timezone de la sesión (UTC por defecto), no como hora Bolivia.
        fechaHoraFinEvento: fechaHoraFinEvento,
        fechaHoraInicioEvento: fechaHoraInicioEvento,
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

  async findAll(query: SettingsDto) {
    return await this.eventoSignificativoRepository.find({
      where: {
        codigoPuntoVenta: query.codigoPuntoVenta,
        codigoSucursal: query.codigoSucursal,
      },
      order: { id: 'DESC' },
    });
  }

  //? ============================================================================================== */
  //?                                      Consulta                                                  */
  //? ============================================================================================== */

  async consultaEventoSignificativo(
    dto: ConsultaEventoSignificativoDto,
    query: SettingsDto,
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
