import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import * as tar from 'tar-stream';
import * as zlib from 'zlib';
import { createHash } from 'crypto';

import { CodigoEmisionEnum } from './enums/codigo-emision.enum';
import { FacturaStatusEnum } from './enums/factura-status.enum';

import { ValidacionPaqueteFacturaDto } from './dto';
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

@Injectable()
export class PaquetesService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,

    @InjectRepository(Paquete)
    private readonly paqueteRepository: Repository<Paquete>,

    private readonly codigosService: CodigosService,

    private readonly eventosSignificativosService: EventosSignificativosService,

    private readonly request: RequestsFacturacionService,
  ) {}

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

      let evento;

      try {
        evento =
          await this.eventosSignificativosService.registroEventoSignificativo(
            {
              codigoMotivoEvento: 2, //! Catalogos
              cufdEvento: primeraFactura.cufd,
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

  // --------------------------------------------------
  // 7. Validar existencia Codigo-Recepcion
  // --------------------------------------------------

  /* if (response.codigoRecepcion) {
      return await this.validacionPaqueteFactura({
        codigoRecepcion: response.codigoRecepcion,
      });
    } */

  //? ============================================================================================== */
  //?                   Enviar_Paquete_Contingencia                                                  */
  //? ============================================================================================== */

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
        paquete: IsNull(),
        cafc: { codigo: dto.cafc }, //! con cafc
      },
      relations: { cafc: true },
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

  // --------------------------------------------------
  // 7. Validar existencia Codigo-Recepcion
  // --------------------------------------------------

  /* if (response.codigoRecepcion) {
      return await this.validacionPaqueteFactura({
        codigoRecepcion: response.codigoRecepcion,
      });
    } */

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
  //?                            Validacion_Paquete                                                  */
  //? ============================================================================================== */

  async validacionPaqueteFactura(
    dto: ValidacionPaqueteFacturaDto,
    //query: QueryDto,
  ) {
    // --------------------------------------------------
    // 1. Obtener códigos vigentes
    // --------------------------------------------------

    const { codigoRecepcion } = dto;

    const paquete = await this.paqueteRepository.findOne({
      where: { codigoRecepcion },
      relations: { facturas: true },
    });

    if (!paquete) {
      throw new NotFoundException('paquete no encontrado');
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
        codigoRecepcion: dto.codigoRecepcion,
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
