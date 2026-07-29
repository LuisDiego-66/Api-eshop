import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';

import * as tar from 'tar-stream';
import * as zlib from 'zlib';
import { createHash } from 'crypto';

import { paginate } from 'src/common/pagination/paginate';

import { SettingsPaginationDto } from '../common/dto/settings.dto';

import { CodigoEmisionEnum } from './enums/codigo-emision.enum';
import { FacturaStatusEnum } from './enums/factura-status.enum';

import { CreatePaqueteContingenciaDto } from './dto/create-paquete-contingencia.dto';

import {
  ResponseRecepcionPaqueteFactura,
  ResponseValidacionPaqueteFactura,
} from './interfaces';

import { CodigosService } from '../codigos/codigos.service';
import { RequestsFacturacionService } from './services/requests-facturacion.service';
import { EventosSignificativosService } from '../operaciones/eventos-significativos.service';

import { Paquete } from './entities/paquete.entity';
import { Factura } from './entities/factura.entity';
import { Cufd } from '../codigos/entities/cufd.entity';
import { EventoSignificativo } from '../operaciones/entities/evento-significativo.entity';

@Injectable()
export class PaquetesService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,

    @InjectRepository(Paquete)
    private readonly paqueteRepository: Repository<Paquete>,

    @InjectRepository(Cufd)
    private readonly cufdRepository: Repository<Cufd>,

    @InjectRepository(EventoSignificativo)
    private readonly eventoSignificativoRepository: Repository<EventoSignificativo>,

    private readonly codigosService: CodigosService,

    private readonly eventosSignificativosService: EventosSignificativosService,

    private readonly request: RequestsFacturacionService,
  ) {}

  //? ============================================================================================== */
  //?                            Find_Cufds_Pendientes_Por_Cafc                                      */
  //? ============================================================================================== */

  async findCufdsPendientesPorCafc(cafc: string) {
    const facturas = await this.facturaRepository.find({
      where: {
        estado: FacturaStatusEnum.PENDIENTE,
        codigoEmision: CodigoEmisionEnum.OFFLINE,
        codigoRecepcion: IsNull(),
        cafc: { codigo: cafc },
      },
      select: { cufd: true },
    });

    const cantidadPorCufd = facturas.reduce(
      (acc, factura) => {
        acc[factura.cufd] = (acc[factura.cufd] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const codigosCufd = Object.keys(cantidadPorCufd);

    //! fechaDesde/fechaHasta son la vigencia real del CUFD (createdAt →
    //! fechaVigencia), no las fechaEmision de las facturas: estas últimas
    //! siempre son "ahora" (momento de registro), no dicen nada de a qué
    //! incidente/día pertenece el CUFD usado.
    const cufds = await this.cufdRepository.find({
      where: { codigo: In(codigosCufd) },
    });

    return cufds.map((cufd) => ({
      cufd: cufd.codigo,
      cantidadFacturas: cantidadPorCufd[cufd.codigo],
      fechaDesde: cufd.createdAt,
      fechaHasta: cufd.fechaVigencia,
    }));
  }

  //? ============================================================================================== */
  //?                                Enviar_Paquete                                                  */
  //? ============================================================================================== */

  async recepcionPaqueteFactura() {
    // --------------------------------------------------
    // 1. Obtener códigos vigentes
    // --------------------------------------------------

    const now = new Date();
    const fechaHoraBolivia = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now);
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    const fechaHora = fechaHoraBolivia.replace(' ', 'T') + '.' + milliseconds;

    // --------------------------------------------------
    // 2. Facturas
    // --------------------------------------------------

    const facturasPendientes = await this.facturaRepository.find({
      where: {
        estado: FacturaStatusEnum.PENDIENTE,
        codigoEmision: CodigoEmisionEnum.OFFLINE,

        codigoRecepcion: IsNull(),
        cafc: IsNull(), //! sin CAFC
      },
      relations: { detalles: true },
      take: 500,

      order: { fechaEmision: 'ASC' },
    });

    if (facturasPendientes.length == 0) {
      throw new BadRequestException('Facturas pendientes no existentes');
    }

    // --------------------------------------------------
    // 2. Agrupar por CUFD, codigoDocumentoSector, tipoFacturaDocumento
    // --------------------------------------------------

    const grupos = facturasPendientes.reduce(
      (acc, factura) => {
        const key = `${factura.cufd}_${factura.codigoDocumentoSector}_${factura.tipoFacturaDocumento}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(factura);
        return acc;
      },
      {} as Record<string, Factura[]>,
    );

    const resultados: any = [];

    // --------------------------------------------------
    // 2. Inicio Loop
    // --------------------------------------------------

    for (const [key, facturas] of Object.entries(grupos)) {
      const primeraFactura = facturas[0];
      const ultimaFactura = facturas[facturas.length - 1];

      const { cufd } = await this.getCodigos({
        codigoPuntoVenta: primeraFactura.codigoPuntoVenta,
        codigoSucursal: primeraFactura.codigoSucursal,
      });

      const fechaInicioEvento = primeraFactura.fechaEmision;
      //const fechaFinEvento = ultimaFactura.fechaEmision;
      const fechaFinEvento =
        facturas.length === 1
          ? new Date(primeraFactura.fechaEmision.getTime() + 3000) // +30 segundos
          : ultimaFactura.fechaEmision;

      const fechaHoraInicioEvento = this.formatFechaSIAT(fechaInicioEvento);
      const fechaHoraFinEvento = this.formatFechaSIAT(fechaFinEvento);

      //! Este flujo ("SIAT caído") no tiene un evento pre-creado por el usuario:
      //! se sigue auto-creando aquí, resolviendo el cufdId a partir del cufd
      //! (texto) con el que ya se emitieron las facturas.
      const cufdEventoEntity = await this.cufdRepository.findOne({
        where: { codigo: primeraFactura.cufd },
      });

      if (!cufdEventoEntity) {
        throw new BadRequestException(
          `CUFD ${primeraFactura.cufd} de la factura no encontrado`,
        );
      }

      let evento;

      try {
        evento =
          await this.eventosSignificativosService.registroEventoSignificativo(
            {
              codigoMotivoEvento: 2, //! Catalogos
              cufdId: cufdEventoEntity.id,
              descripcion:
                'INACCESIBILIDAD AL SERVICIO WEB DE LA ADMINISTRACIÓN TRIBUTARIA',
              fechaHoraInicioEvento: fechaHoraInicioEvento,
              fechaHoraFinEvento: fechaHoraFinEvento,
            },
            {
              codigoPuntoVenta: primeraFactura.codigoPuntoVenta, //! el mismo para todas las facturas
              codigoSucursal: primeraFactura.codigoSucursal, //! el mismo para todas las facturas
            },
          );
      } catch (error) {
        throw new BadRequestException(error.response || error.message);
      }

      if (!evento.codigoRecepcionEventoSignificativo) {
        return evento;
      }

      // --------------------------------------------------
      // 3. Generar archivo y hash
      // --------------------------------------------------

      const { archivo, hashArchivo } = await crearTarGz(facturas);

      // --------------------------------------------------
      // 4. Persistir factura ANTES de SIAT
      // --------------------------------------------------

      const newPaquete = this.paqueteRepository.create({
        codigoAmbiente: cufd.codigoAmbiente,
        codigoPuntoVenta: cufd.codigoPuntoVenta,
        codigoSistema: cufd.codigoSistema,
        codigoSucursal: cufd.codigoSucursal,
        nit: cufd.nit,
        codigoDocumentoSector: primeraFactura.codigoDocumentoSector,
        codigoEmision: CodigoEmisionEnum.OFFLINE,
        codigoModalidad: cufd.codigoModalidad,
        codigoCufd: cufd.codigo,
        codigoCuis: cufd.codigoCuis,
        tipoFacturaDocumento: primeraFactura.tipoFacturaDocumento,
        archivo: archivo,
        fechaEnvio: fechaHora,
        hashArchivo: hashArchivo,
        cantidadFacturas: facturas.length,
        codigoEvento: evento.codigoRecepcionEventoSignificativo,
        eventoSignificativo: evento,
        facturas,
      });
      const paquete = await this.paqueteRepository.save(newPaquete);

      // --------------------------------------------------
      // 5. Envío a SIAT
      // --------------------------------------------------

      const recepcionPaqueteFacturaResponse: ResponseRecepcionPaqueteFactura =
        await this.request.recepcionPaqueteFactura({
          codigoAmbiente: cufd.codigoAmbiente,
          codigoDocumentoSector: primeraFactura.codigoDocumentoSector,
          codigoEmision: CodigoEmisionEnum.OFFLINE,
          codigoModalidad: cufd.codigoModalidad,
          codigoPuntoVenta: cufd.codigoPuntoVenta,
          codigoSistema: cufd.codigoSistema,
          codigoSucursal: cufd.codigoSucursal,
          codigoCufd: cufd.codigo,
          codigoCuis: cufd.codigoCuis,
          nit: cufd.nit,
          tipoFacturaDocumento: primeraFactura.tipoFacturaDocumento,
          archivo: archivo,
          fechaEnvio: fechaHora,
          hashArchivo: hashArchivo,
          cantidadFacturas: facturas.length,
          codigoEvento: evento.codigoRecepcionEventoSignificativo,
        });

      if (!recepcionPaqueteFacturaResponse.success) {
        //! Servicio de paquetes de SIAT caído: el paquete y las facturas ya
        //! quedaron persistidos (offline), la transmisión queda pendiente
        //! para un reintento posterior.
        resultados.push({
          success: false,
          paqueteId: paquete.id,
          error: recepcionPaqueteFacturaResponse.error,
        });
        continue;
      }

      const response =
        recepcionPaqueteFacturaResponse.data.RespuestaServicioFacturacion;

      // --------------------------------------------------
      // 6. Guardar respuesta SIAT
      // --------------------------------------------------

      if (response.transaccion && response.codigoRecepcion) {
        for (const factura of paquete.facturas) {
          factura.estado = FacturaStatusEnum.ENVIADA;
        }
        await this.facturaRepository.save(paquete.facturas);

        await this.paqueteRepository.update(paquete.id, {
          codigoDescripcion: response.codigoDescripcion,
          codigoEstado: response.codigoEstado,
          codigoRecepcion: response.codigoRecepcion ?? null,
          transaccion: response.transaccion,
          mensajesList: response.mensajesList ?? null,
          fechaRespuesta: recepcionPaqueteFacturaResponse.timestamp,
        });
      }

      resultados.push(response);
    }

    return resultados;
  }

  //? ============================================================================================== */
  //?                   Enviar_Paquete_Contingencia                                                  */
  //? ============================================================================================== */

  /*
  //! Versión anterior: recibía cufd/codigoEvento/descripcionEvento sueltos y
  //! auto-creaba el evento significativo a partir de las fechaEmision de las
  //! facturas del lote, en vez de reutilizar un evento ya creado y elegido
  //! por el usuario (con su propio cufd y ventana de fechas).
  async recepcionPaqueteFacturaContingencia(dto: CreatePaqueteContingenciaDto) {
    // --------------------------------------------------
    // 1. Obtener códigos vigentes
    // --------------------------------------------------

    const now = new Date();
    const fechaHoraBolivia = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now);
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    const fechaHora = fechaHoraBolivia.replace(' ', 'T') + '.' + milliseconds;

    // --------------------------------------------------
    // 2. Facturas
    // --------------------------------------------------

    const facturasPendientes = await this.facturaRepository.find({
      where: {
        estado: FacturaStatusEnum.PENDIENTE,
        codigoEmision: CodigoEmisionEnum.OFFLINE,

        codigoRecepcion: IsNull(),
        //paquete: IsNull(),
        cafc: { codigo: dto.cafc }, //! con cafc
        // NUEVO: antes se traían TODAS las facturas pendientes del cafc,
        // sin importar el día/cufd (podían mezclarse incidentes distintos
        // bajo el mismo codigoEvento/descripcionEvento del dto). Ahora se
        // acota al cufd del incidente puntual que se está reportando.
        // Para revertir: quitar la línea "cufd: dto.cufd," de abajo.
        cufd: dto.cufd,
      },
      relations: { cafc: true, detalles: true },
      take: 500,
      order: { fechaEmision: 'ASC' },
    });
    if (facturasPendientes.length == 0) {
      throw new BadRequestException('Facturas pendientes no existentes');
    }

    // --------------------------------------------------
    // 2. Agrupar por CUFD, codigoDocumentoSector, tipoFacturaDocumento
    // --------------------------------------------------

    const grupos = facturasPendientes.reduce(
      (acc, factura) => {
        const key = `${factura.cufd}_${factura.codigoDocumentoSector}_${factura.tipoFacturaDocumento}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(factura);
        return acc;
      },
      {} as Record<string, Factura[]>,
    );

    const resultados: any = [];

    for (const [key, facturas] of Object.entries(grupos)) {
      const primeraFactura = facturas[0];
      const ultimaFactura = facturas[facturas.length - 1];

      const { cufd } = await this.getCodigos({
        codigoPuntoVenta: primeraFactura.codigoPuntoVenta,
        codigoSucursal: primeraFactura.codigoSucursal,
      });

      const fechaInicioEvento = primeraFactura.fechaEmision;
      //const fechaFinEvento = ultimaFactura.fechaEmision;
      const fechaFinEvento =
        facturas.length === 1
          ? new Date(primeraFactura.fechaEmision.getTime() + 3000) // +30 segundos
          : ultimaFactura.fechaEmision;

      const fechaHoraInicioEvento = this.formatFechaSIAT(fechaInicioEvento);
      const fechaHoraFinEvento = this.formatFechaSIAT(fechaFinEvento);

      let evento;

      try {
        evento =
          await this.eventosSignificativosService.registroEventoSignificativo(
            {
              codigoMotivoEvento: dto.codigoEvento, //! Catalogos
              cufdEvento: primeraFactura.cufd,
              descripcion: dto.descripcionEvento,

              fechaHoraInicioEvento: fechaHoraInicioEvento,
              fechaHoraFinEvento: fechaHoraFinEvento,
            },
            {
              codigoPuntoVenta: primeraFactura.codigoPuntoVenta, //! el mismo para todas las facturas
              codigoSucursal: primeraFactura.codigoSucursal, //! el mismo para todas las facturas
            },
          );
      } catch (error) {
        throw new BadRequestException(error.response || error.message);
      }

      if (!evento.codigoRecepcionEventoSignificativo) {
        return evento;
      }

      // --------------------------------------------------
      // 3. Generar archivo y hash
      // --------------------------------------------------

      const { archivo, hashArchivo } = await crearTarGz(facturas);

      // --------------------------------------------------
      // 4. Persistir factura ANTES de SIAT
      // --------------------------------------------------

      const newPaquete = this.paqueteRepository.create({
        codigoAmbiente: cufd.codigoAmbiente,
        codigoPuntoVenta: cufd.codigoPuntoVenta,
        codigoSistema: cufd.codigoSistema,
        codigoSucursal: cufd.codigoSucursal,
        nit: cufd.nit,
        codigoDocumentoSector: primeraFactura.codigoDocumentoSector,
        codigoEmision: CodigoEmisionEnum.OFFLINE,
        codigoModalidad: cufd.codigoModalidad,
        codigoCufd: cufd.codigo,
        codigoCuis: cufd.codigoCuis,
        tipoFacturaDocumento: primeraFactura.tipoFacturaDocumento,
        archivo: archivo,
        fechaEnvio: fechaHora,
        hashArchivo: hashArchivo,
        cafc: dto.cafc, //! CAFC
        cantidadFacturas: facturas.length,
        codigoEvento: evento.codigoRecepcionEventoSignificativo,
        facturas,
      });
      const paquete = await this.paqueteRepository.save(newPaquete);

      // --------------------------------------------------
      // 5. Envío a SIAT
      // --------------------------------------------------

      const recepcionPaqueteFacturaResponse: ResponseRecepcionPaqueteFactura =
        await this.request.recepcionPaqueteFactura({
          codigoAmbiente: cufd.codigoAmbiente,
          codigoDocumentoSector: primeraFactura.codigoDocumentoSector,
          codigoEmision: CodigoEmisionEnum.OFFLINE,
          codigoModalidad: cufd.codigoModalidad,
          codigoPuntoVenta: cufd.codigoPuntoVenta,
          codigoSistema: cufd.codigoSistema,
          codigoSucursal: cufd.codigoSucursal,
          codigoCufd: cufd.codigo,
          codigoCuis: cufd.codigoCuis,
          nit: cufd.nit,
          tipoFacturaDocumento: primeraFactura.tipoFacturaDocumento,
          archivo: archivo,
          fechaEnvio: fechaHora,
          hashArchivo: hashArchivo,
          cafc: dto.cafc, //! CAFC
          cantidadFacturas: facturas.length,
          codigoEvento: evento.codigoRecepcionEventoSignificativo,
        });

      if (!recepcionPaqueteFacturaResponse.success) {
        //! Servicio de paquetes de SIAT caído: el paquete y las facturas ya
        //! quedaron persistidos (offline), la transmisión queda pendiente
        //! para un reintento posterior.
        resultados.push({
          success: false,
          paqueteId: paquete.id,
          error: recepcionPaqueteFacturaResponse.error,
        });
        continue;
      }

      const response =
        recepcionPaqueteFacturaResponse.data.RespuestaServicioFacturacion;

      // --------------------------------------------------
      // 6. Guardar respuesta SIAT
      // --------------------------------------------------

      if (response.transaccion && response.codigoRecepcion) {
        for (const factura of paquete.facturas) {
          factura.estado = FacturaStatusEnum.ENVIADA;
        }
        await this.facturaRepository.save(paquete.facturas);

        await this.paqueteRepository.update(paquete.id, {
          codigoDescripcion: response.codigoDescripcion,
          codigoEstado: response.codigoEstado,
          codigoRecepcion: response.codigoRecepcion ?? null,
          transaccion: response.transaccion,
          mensajesList: response.mensajesList ?? null,
          fechaRespuesta: recepcionPaqueteFacturaResponse.timestamp,
        });
      }

      resultados.push(response);
    }

    return resultados;
  }
  */

  async recepcionPaqueteFacturaContingencia(dto: CreatePaqueteContingenciaDto) {
    // --------------------------------------------------
    // 1. Evento significativo ya registrado (define cafc + cufd del lote)
    // --------------------------------------------------

    const evento = await this.eventoSignificativoRepository.findOne({
      where: { id: dto.eventoSignificativoId },
      relations: { cufd: true },
    });

    if (!evento) {
      throw new BadRequestException('Evento significativo no encontrado');
    }

    if (!evento.codigoRecepcionEventoSignificativo) {
      throw new BadRequestException(
        'El evento significativo indicado no fue registrado exitosamente en SIAT',
      );
    }

    const now = new Date();
    const fechaHoraBolivia = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now);
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    const fechaHora = fechaHoraBolivia.replace(' ', 'T') + '.' + milliseconds;

    // --------------------------------------------------
    // 2. Facturas pendientes declaradas específicamente bajo este evento
    //    (relación directa, no un match por cufd+cafc que podría mezclar
    //    facturas de otro evento que use el mismo cufd/cafc)
    // --------------------------------------------------

    const facturasPendientes = await this.facturaRepository.find({
      where: {
        estado: FacturaStatusEnum.PENDIENTE,
        codigoEmision: CodigoEmisionEnum.OFFLINE,
        codigoRecepcion: IsNull(),
        cafc: { codigo: dto.cafc },
        eventoSignificativo: { id: evento.id },
      },
      relations: { cafc: true, detalles: true },
      take: 500,
      order: { fechaEmision: 'ASC' },
    });
    if (facturasPendientes.length == 0) {
      throw new BadRequestException('Facturas pendientes no existentes');
    }

    // --------------------------------------------------
    // 3. Agrupar por codigoDocumentoSector, tipoFacturaDocumento
    //    (el cufd ya es el mismo para todas: el del evento elegido)
    // --------------------------------------------------

    const grupos = facturasPendientes.reduce(
      (acc, factura) => {
        const key = `${factura.codigoDocumentoSector}_${factura.tipoFacturaDocumento}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(factura);
        return acc;
      },
      {} as Record<string, Factura[]>,
    );

    const resultados: any = [];

    for (const [key, facturas] of Object.entries(grupos)) {
      const primeraFactura = facturas[0];

      const { cufd } = await this.getCodigos({
        codigoPuntoVenta: primeraFactura.codigoPuntoVenta,
        codigoSucursal: primeraFactura.codigoSucursal,
      });

      // --------------------------------------------------
      // 4. Generar archivo y hash
      // --------------------------------------------------

      const { archivo, hashArchivo } = await crearTarGz(facturas);

      // --------------------------------------------------
      // 5. Persistir paquete ANTES de SIAT
      // --------------------------------------------------

      const newPaquete = this.paqueteRepository.create({
        codigoAmbiente: cufd.codigoAmbiente,
        codigoPuntoVenta: cufd.codigoPuntoVenta,
        codigoSistema: cufd.codigoSistema,
        codigoSucursal: cufd.codigoSucursal,
        nit: cufd.nit,
        codigoDocumentoSector: primeraFactura.codigoDocumentoSector,
        codigoEmision: CodigoEmisionEnum.OFFLINE,
        codigoModalidad: cufd.codigoModalidad,
        codigoCufd: cufd.codigo,
        codigoCuis: cufd.codigoCuis,
        tipoFacturaDocumento: primeraFactura.tipoFacturaDocumento,
        archivo: archivo,
        fechaEnvio: fechaHora,
        hashArchivo: hashArchivo,
        cafc: dto.cafc, //! CAFC
        cantidadFacturas: facturas.length,
        codigoEvento: evento.codigoRecepcionEventoSignificativo,
        eventoSignificativo: evento,
        facturas,
      });
      const paquete = await this.paqueteRepository.save(newPaquete);

      // --------------------------------------------------
      // 6. Envío a SIAT
      // --------------------------------------------------

      const recepcionPaqueteFacturaResponse: ResponseRecepcionPaqueteFactura =
        await this.request.recepcionPaqueteFactura({
          codigoAmbiente: cufd.codigoAmbiente,
          codigoDocumentoSector: primeraFactura.codigoDocumentoSector,
          codigoEmision: CodigoEmisionEnum.OFFLINE,
          codigoModalidad: cufd.codigoModalidad,
          codigoPuntoVenta: cufd.codigoPuntoVenta,
          codigoSistema: cufd.codigoSistema,
          codigoSucursal: cufd.codigoSucursal,
          codigoCufd: cufd.codigo,
          codigoCuis: cufd.codigoCuis,
          nit: cufd.nit,
          tipoFacturaDocumento: primeraFactura.tipoFacturaDocumento,
          archivo: archivo,
          fechaEnvio: fechaHora,
          hashArchivo: hashArchivo,
          cafc: dto.cafc, //! CAFC
          cantidadFacturas: facturas.length,
          codigoEvento: evento.codigoRecepcionEventoSignificativo,
        });

      if (!recepcionPaqueteFacturaResponse.success) {
        //! Servicio de paquetes de SIAT caído: el paquete y las facturas ya
        //! quedaron persistidos (offline), la transmisión queda pendiente
        //! para un reintento posterior.
        resultados.push({
          success: false,
          paqueteId: paquete.id,
          error: recepcionPaqueteFacturaResponse.error,
        });
        continue;
      }

      const response =
        recepcionPaqueteFacturaResponse.data.RespuestaServicioFacturacion;

      // --------------------------------------------------
      // 7. Guardar respuesta SIAT
      // --------------------------------------------------

      if (response.transaccion && response.codigoRecepcion) {
        for (const factura of paquete.facturas) {
          factura.estado = FacturaStatusEnum.ENVIADA;
        }
        await this.facturaRepository.save(paquete.facturas);

        await this.paqueteRepository.update(paquete.id, {
          codigoDescripcion: response.codigoDescripcion,
          codigoEstado: response.codigoEstado,
          codigoRecepcion: response.codigoRecepcion ?? null,
          transaccion: response.transaccion,
          mensajesList: response.mensajesList ?? null,
          fechaRespuesta: recepcionPaqueteFacturaResponse.timestamp,
        });
      }

      resultados.push(response);
    }

    return resultados;
  }

  //? ============================================================================================== */

  private formatFechaSIAT(date: Date): string {
    return new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
      .format(date)
      .replace(' ', 'T');
  }

  //? ============================================================================================== */
  //?                                    FindAll                                                    */
  //? ============================================================================================== */

  async findAll(query: SettingsPaginationDto) {
    const { codigoSucursal, codigoPuntoVenta } = query;

    return paginate(
      this.paqueteRepository,
      {
        where: { codigoSucursal, codigoPuntoVenta },
        order: { id: 'DESC' },
      },
      query,
    );
  }

  //? ============================================================================================== */
  //?                                    FindOne                                                    */
  //? ============================================================================================== */

  async findOne(id: number) {
    const paquete = await this.paqueteRepository.findOne({
      where: { id },
      relations: { facturas: true },
    });

    if (!paquete) {
      throw new NotFoundException(`Paquete con id ${id} no encontrado`);
    }

    return paquete;
  }

  //? ============================================================================================== */
  //?                            Validacion_Paquete                                                  */
  //? ============================================================================================== */

  async validacionPaqueteFactura(
    id: number,
    //query: SettingsDto,
  ) {
    // --------------------------------------------------
    // 1. Obtener códigos vigentes
    // --------------------------------------------------

    const paquete = await this.paqueteRepository.findOne({
      where: { id },
      relations: { facturas: { detalles: true } },
    });

    if (!paquete) {
      throw new NotFoundException('paquete no encontrado');
    }

    if (!paquete.codigoRecepcion) {
      throw new BadRequestException(
        'El paquete no cuenta con un código de recepción de SIAT para validar',
      );
    }

    const { cufd } = await this.getCodigos({
      codigoPuntoVenta: paquete.codigoPuntoVenta,
      codigoSucursal: paquete.codigoSucursal,
    });

    // --------------------------------------------------
    // 2. Request
    // --------------------------------------------------

    const validacionPaqueteFacturaResponse: ResponseValidacionPaqueteFactura =
      await this.request.validacionRecepcionPaqueteFactura({
        codigoAmbiente: cufd.codigoAmbiente,
        codigoDocumentoSector: paquete.codigoDocumentoSector,
        codigoEmision: paquete.codigoEmision,
        codigoModalidad: cufd.codigoModalidad,
        codigoPuntoVenta: cufd.codigoPuntoVenta,
        codigoSistema: cufd.codigoSistema,
        codigoSucursal: cufd.codigoSucursal,
        codigoCufd: cufd.codigo,
        codigoCuis: cufd.codigoCuis,
        nit: cufd.nit,
        tipoFacturaDocumento: paquete.tipoFacturaDocumento,
        codigoRecepcion: paquete.codigoRecepcion,
      });
    const response =
      validacionPaqueteFacturaResponse.data.RespuestaServicioFacturacion;

    // --------------------------------------------------
    // 2. Actualizar el codigo descripcion si esta validado
    // --------------------------------------------------

    if (response.transaccion && response.codigoRecepcion) {
      for (const factura of paquete.facturas) {
        factura.estado = response.codigoDescripcion as FacturaStatusEnum;
      }

      await this.facturaRepository.save(paquete.facturas);

      await this.paqueteRepository.update(paquete.id, {
        codigoDescripcion: response.codigoDescripcion,
        codigoEstado: response.codigoEstado,
      });

      // El correo de cada factura (offline y contingencia) ya se envía al momento de emitirse.
    } else {
      for (const factura of paquete.facturas) {
        factura.estado = FacturaStatusEnum.RECHAZADA;
        factura.codigoRecepcion = null;
      }

      await this.facturaRepository.save(paquete.facturas);

      await this.paqueteRepository.update(paquete.id, {
        codigoDescripcion: response.codigoDescripcion,
        codigoEstado: response.codigoEstado,
        codigoRecepcion: null,
      });
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

//* ============================================================================================== */
//*                                     Functions                                                  */
//* ============================================================================================== */

async function crearTarGz(
  facturas: Factura[],
): Promise<{ archivo: string; hashArchivo: string }> {
  return new Promise((resolve, reject) => {
    const pack = tar.pack();
    const gzip = zlib.createGzip();
    const chunks: Buffer[] = [];

    gzip.on('data', (chunk) => chunks.push(chunk));
    gzip.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const hashArchivo = createHash('sha256').update(buffer).digest('hex');
      const archivo = buffer.toString('base64');
      resolve({ archivo, hashArchivo });
    });
    gzip.on('error', reject);

    pack.pipe(gzip);

    try {
      for (const factura of facturas) {
        if (!factura.xml) {
          throw new Error(`Factura ${factura.cuf} no tiene XML`);
        }

        pack.entry({ name: `${factura.cuf}.xml` }, factura.xml);
      }

      pack.finalize();
    } catch (err) {
      reject(err);
    }
  });
}
