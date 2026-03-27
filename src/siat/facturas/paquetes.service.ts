import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import * as tar from 'tar-stream';
import * as zlib from 'zlib';
import { createHash } from 'crypto';

import { CodigoEmisionEnum } from './enums/codigo-emision.enum';
import { FacturaStatusEnum } from './enums/factura-status.enum';

import { QueryDto } from '../common/dto/query.dto';
import { CreatePaqueteDto, ValidacionPaqueteFacturaDto } from './dto';
import {
  ResponseRecepcionPaqueteFactura,
  ResponseValidacionPaqueteFactura,
} from './interfaces';

import { CodigosService } from '../codigos/codigos.service';
import { FechaHoraService } from '../catalogos/fecha-hora.service';
import { RequestsFacturacionService } from './services/requests-facturacion.service';

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
    private readonly fechaHoraService: FechaHoraService,
    private readonly request: RequestsFacturacionService,
  ) {}

  //? ============================================================================================== */
  //?                                Enviar_Paquete                                                  */
  //? ============================================================================================== */

  async recepcionPaqueteFactura(dto: CreatePaqueteDto, query: QueryDto) {
    // --------------------------------------------------
    // 1. Obtener códigos vigentes
    // --------------------------------------------------

    const { cufd } = await this.getCodigos({
      codigoPuntoVenta: query.codigoPuntoVenta,
      codigoSucursal: query.codigoSucursal,
    });
    const fechaHora = await this.fechaHoraService.getFechaHora(cufd);

    // --------------------------------------------------
    // 2. Facturas
    // --------------------------------------------------

    const facturas = await this.facturaRepository.find({
      where: {
        estado: FacturaStatusEnum.PENDIENTE,
        codigoRecepcion: IsNull(),
        paquete: IsNull(),
      },
      order: { fechaEmision: 'ASC' },
    });
    if (facturas.length == 0) {
      throw new BadRequestException('Facturas pendientes no existentes');
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
      codigoDocumentoSector: dto.codigoDocumentoSector,
      codigoEmision: CodigoEmisionEnum.OFFLINE,
      codigoModalidad: cufd.codigoModalidad,
      codigoCufd: cufd.codigo,
      codigoCuis: cufd.codigoCuis,
      tipoFacturaDocumento: dto.tipoFacturaDocumento,
      archivo: archivo,
      fechaEnvio: fechaHora.fechaHora,
      hashArchivo: hashArchivo,
      cantidadFacturas: facturas.length,
      codigoEvento: dto.codigoEvento,
      facturas,
    });
    const paquete = await this.paqueteRepository.save(newPaquete);

    // --------------------------------------------------
    // 5. Envío a SIAT
    // --------------------------------------------------

    const recepcionPaqueteFacturaResponse: ResponseRecepcionPaqueteFactura =
      await this.request.recepcionPaqueteFactura({
        codigoAmbiente: cufd.codigoAmbiente,
        codigoDocumentoSector: dto.codigoDocumentoSector,
        codigoEmision: CodigoEmisionEnum.OFFLINE,
        codigoModalidad: cufd.codigoModalidad,
        codigoPuntoVenta: cufd.codigoPuntoVenta,
        codigoSistema: cufd.codigoSistema,
        codigoSucursal: cufd.codigoSucursal,
        codigoCufd: cufd.codigo,
        codigoCuis: cufd.codigoCuis,
        nit: cufd.nit,
        tipoFacturaDocumento: dto.tipoFacturaDocumento,
        archivo: archivo,
        fechaEnvio: fechaHora.fechaHora,
        hashArchivo: hashArchivo,
        //cafc?: number; //! opcional //Código de Autorización de Facturación por Contingencia
        cantidadFacturas: facturas.length,
        codigoEvento: dto.codigoEvento,
      });
    const response =
      recepcionPaqueteFacturaResponse.data.RespuestaServicioFacturacion;

    // --------------------------------------------------
    // 6. Guardar respuesta SIAT
    // --------------------------------------------------

    if (response.transaccion && response.codigoRecepcion) {
      for (const factura of paquete.facturas) {
        factura.estado = FacturaStatusEnum.ENVIADA;
        await this.facturaRepository.save(factura);
      }

      await this.paqueteRepository.update(paquete.id, {
        codigoDescripcion: response.codigoDescripcion,
        codigoEstado: response.codigoEstado,
        codigoRecepcion: response.codigoRecepcion ?? null,
        transaccion: response.transaccion,
        mensajesList: response.mensajesList ?? null,
        fechaRespuesta: recepcionPaqueteFacturaResponse.timestamp,
      });
    }

    return response;

    // --------------------------------------------------
    // 7. Validar existencia Codigo-Recepcion
    // --------------------------------------------------

    /* if (response.codigoRecepcion) {
      return await this.validacionPaqueteFactura({
        codigoRecepcion: response.codigoRecepcion,
      });
    } */
  }

  //? ============================================================================================== */
  //?                            Validacion_Paquete                                                  */
  //? ============================================================================================== */

  async validacionPaqueteFactura(
    dto: ValidacionPaqueteFacturaDto,
    query: QueryDto,
  ) {
    // --------------------------------------------------
    // 1. Obtener códigos vigentes
    // --------------------------------------------------

    const { cufd } = await this.getCodigos({
      codigoPuntoVenta: query.codigoPuntoVenta,
      codigoSucursal: query.codigoSucursal,
    });

    // --------------------------------------------------
    // 2. Request
    // --------------------------------------------------

    const validacionPaqueteFacturaResponse: ResponseValidacionPaqueteFactura =
      await this.request.validacionRecepcionPaqueteFactura({
        codigoAmbiente: cufd.codigoAmbiente,
        codigoDocumentoSector: dto.codigoDocumentoSector,
        codigoEmision: dto.codigoEmision,
        codigoModalidad: cufd.codigoModalidad,
        codigoPuntoVenta: cufd.codigoPuntoVenta,
        codigoSistema: cufd.codigoSistema,
        codigoSucursal: cufd.codigoSucursal,
        codigoCufd: cufd.codigo,
        codigoCuis: cufd.codigoCuis,
        nit: cufd.nit,
        tipoFacturaDocumento: dto.tipoFacturaDocumento,
        codigoRecepcion: dto.codigoRecepcion,
      });
    const response =
      validacionPaqueteFacturaResponse.data.RespuestaServicioFacturacion;

    // --------------------------------------------------
    // 2. Actualizar el codigo descripcion si esta validado
    // --------------------------------------------------

    if (response.transaccion && response.codigoRecepcion) {
      const paquete = await this.paqueteRepository.findOne({
        where: { codigoRecepcion: response.codigoRecepcion },
        relations: { facturas: true },
      });
      if (paquete) {
        for (const factura of paquete.facturas) {
          factura.estado = FacturaStatusEnum.VALIDADA;
          await this.facturaRepository.save(factura);
        }

        await this.paqueteRepository.update(paquete.id, {
          codigoDescripcion: response.codigoDescripcion,
          codigoEstado: response.codigoEstado,
        });
      }
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
