import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as zlib from 'zlib';

import { algoritmoHash } from '../helpers/functions';
import { generarCUF } from '../helpers/cuf.generator';
import { formatDateForCUF } from '../helpers/date.util';

import { CodigoEmisionEnum } from './enums/codigo-emision.enum';
import { FacturaStatusEnum } from './enums/factura-status.enum';

import {
  CreateFacturaDto,
  AnulacionFacturaDto,
  VerificacionEstadoFacturaDto,
  ReversionAnulacionFacturaDto,
} from './dto';
import { QueryDto } from '../common/dto/query.dto';

import {
  ResponseRecepcionFactura,
  ResponseAnulacionFactura,
  ResponseReversionAnulacionFactura,
} from './interfaces';

import { CodigosService } from '../codigos/codigos.service';
import { FechaHoraService } from '../catalogos/fecha-hora.service';
import { FacturaBuilderService } from './services/factura-builder.service';
import { SincronizacionService } from '../catalogos/services/sincronizacion.service';
import { RequestsFacturacionService } from './services/requests-facturacion.service';

import { Factura } from './entities/factura.entity';

@Injectable()
export class FacturacionService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,

    private readonly codigosService: CodigosService,
    private readonly fechaHoraService: FechaHoraService,
    private readonly request: RequestsFacturacionService,
    private readonly facturaBuilderService: FacturaBuilderService,
    private readonly sincronizacionService: SincronizacionService,
  ) {}

  //? ============================================================================================== */
  //?                            Facturacion_Online                                                  */
  //? ============================================================================================== */

  async facturacionOnline(dto: CreateFacturaDto, query: QueryDto) {
    // --------------------------------------------------
    // 1. Obtener códigos vigentes
    // --------------------------------------------------

    const { cufd } = await this.getCodigos({
      codigoPuntoVenta: query.codigoPuntoVenta,
      codigoSucursal: query.codigoSucursal,
    });
    const { tipoDocumentoSector, tipoEmision, tipoFactura, ...data } = dto;
    const fechaHora = await this.fechaHoraService.getFechaHora(cufd);

    // --------------------------------------------------
    // 2. Número de factura
    // --------------------------------------------------

    const count = await this.facturaRepository.count({});
    const numeroFactura = count + 1;

    // --------------------------------------------------
    // 3. Generar CUF
    // --------------------------------------------------

    const cuf = this.getCuf({
      nit: cufd.nit,
      fechaHora: fechaHora.fechaHora,
      codigoModalidad: cufd.codigoModalidad,
      codigoSucursal: cufd.codigoSucursal,
      codigoPuntoVenta: cufd.codigoPuntoVenta,
      codigoControlCUFD: cufd.codigoControl,

      tipoDocumentoSector: tipoDocumentoSector,
      tipoEmision: tipoEmision,
      tipoFactura: tipoFactura,
      numeroFactura: numeroFactura,
    });

    // --------------------------------------------------
    // 5. Construcción del XML
    // --------------------------------------------------

    const xml = this.facturaBuilderService.buildFactura({
      nitEmisor: cufd.nit,
      razonSocialEmisor: data.razonSocialEmisor,
      municipio: data.municipio,
      telefono: data.telefono,

      numeroFactura: numeroFactura,
      cuf: cuf,
      cufd: cufd.codigo,
      codigoSucursal: cufd.codigoSucursal,
      direccion: cufd.direccion,
      codigoPuntoVenta: cufd.codigoPuntoVenta,
      fechaEmision: new Date(fechaHora.fechaHora),

      nombreRazonSocial: data.nombreRazonSocial,
      codigoTipoDocumentoIdentidad: data.codigoTipoDocumentoIdentidad,
      numeroDocumento: data.numeroDocumento,
      complemento: data.complemento,
      codigoCliente: data.codigoCliente,
      codigoMetodoPago: data.codigoMetodoPago,
      numeroTarjeta: data.numeroTarjeta,

      montoTotal: data.montoTotal,
      montoTotalSujetoIva: data.montoTotalSujetoIva,

      codigoMoneda: data.codigoMoneda,
      tipoCambio: data.tipoCambio,
      montoTotalMoneda: data.montoTotalMoneda,

      montoGiftCard: data.montoGiftCard,
      descuentoAdicional: data.descuentoAdicional,
      codigoExcepcion: data.codigoExcepcion,

      cafc: data.cafc,

      leyenda: data.leyenda,
      usuario: data.usuario,
      codigoDocumentoSector: data.codigoDocumentoSector,

      detalles: data.detalles,
    });

    // --------------------------------------------------
    // 6. Generar archivo y hash
    // --------------------------------------------------

    const { archivo, hashArchivo } = this.generateArchivoHash(xml);

    // --------------------------------------------------
    // 7. Persistir factura ANTES de SIAT
    // --------------------------------------------------

    const siatSync = await this.sincronizacionService.sincronizacion(query);

    const newFactura = this.facturaRepository.create({
      nitEmisor: cufd.nit,
      razonSocialEmisor: data.razonSocialEmisor,
      municipio: data.municipio,
      telefono: data.telefono,

      numeroFactura: numeroFactura,
      cuf: cuf,
      cufd: cufd.codigo,
      codigoSucursal: cufd.codigoSucursal,
      direccion: cufd.direccion,
      codigoPuntoVenta: cufd.codigoPuntoVenta,
      tipoFacturaDocumento: data.tipoFacturaDocumento,
      fechaEmision: new Date(fechaHora.fechaHora),

      nombreRazonSocial: data.nombreRazonSocial,
      codigoTipoDocumentoIdentidad: data.codigoTipoDocumentoIdentidad,
      numeroDocumento: data.numeroDocumento,
      complemento: data.complemento,
      codigoCliente: data.codigoCliente,
      codigoMetodoPago: data.codigoMetodoPago,
      numeroTarjeta: data.numeroTarjeta,

      montoTotal: data.montoTotal,
      montoTotalSujetoIva: data.montoTotalSujetoIva,

      codigoMoneda: data.codigoMoneda,
      tipoCambio: data.tipoCambio,
      montoTotalMoneda: data.montoTotalMoneda,

      montoGiftCard: data.montoGiftCard,
      descuentoAdicional: data.descuentoAdicional,
      codigoExcepcion: data.codigoExcepcion,

      cafc: data.cafc,

      leyenda: data.leyenda,
      usuario: data.usuario,
      codigoDocumentoSector: data.codigoDocumentoSector,

      estado: FacturaStatusEnum.PENDIENTE,
      codigoEmision: CodigoEmisionEnum.ONLINE,

      siatSync: siatSync,

      xml,
    });
    const factura = await this.facturaRepository.save(newFactura);

    // --------------------------------------------------
    // 8. Envío a SIAT (Etapa IV – Emisión Individual)
    // --------------------------------------------------

    const recepcionFacturaResponse: ResponseRecepcionFactura =
      await this.request.recepcionFactura({
        codigoAmbiente: cufd.codigoAmbiente,
        codigoDocumentoSector: factura.codigoDocumentoSector,
        codigoEmision: CodigoEmisionEnum.ONLINE,
        codigoModalidad: cufd.codigoModalidad,
        codigoPuntoVenta: cufd.codigoPuntoVenta,
        codigoSistema: cufd.codigoSistema,
        codigoSucursal: cufd.codigoSucursal,
        codigoCufd: cufd.codigo,
        codigoCuis: cufd.codigoCuis,
        nit: cufd.nit,
        tipoFacturaDocumento: factura.tipoFacturaDocumento,
        archivo: archivo,
        fechaEnvio: fechaHora.fechaHora,
        hashArchivo: hashArchivo,
      });
    const response = recepcionFacturaResponse.data.RespuestaServicioFacturacion;

    // --------------------------------------------------
    // 9. Guardar respuesta SIAT
    // --------------------------------------------------

    await this.facturaRepository.update(factura.id, {
      codigoDescripcion: response.codigoDescripcion,
      codigoEstado: response.codigoEstado,
      codigoRecepcion: response.codigoRecepcion ?? null,
      transaccion: response.transaccion,
      mensajesList: response.mensajesList ?? null,
      fechaRespuesta: recepcionFacturaResponse.timestamp,
      estado: response.transaccion
        ? FacturaStatusEnum.VALIDADA
        : FacturaStatusEnum.RECHAZADA,
    });

    return response;
  }

  //? ============================================================================================== */
  //?                           Facturacion_Offline                                                  */
  //? ============================================================================================== */

  async facturacionOffline(dto: CreateFacturaDto, query: QueryDto) {
    // --------------------------------------------------
    // 1. Obtener códigos vigentes
    // --------------------------------------------------

    const { cufd } = await this.getCodigos({
      codigoPuntoVenta: query.codigoPuntoVenta,
      codigoSucursal: query.codigoSucursal,
    });
    const { tipoDocumentoSector, tipoEmision, tipoFactura, ...data } = dto;
    const fechaHora = await this.fechaHoraService.getFechaHora(cufd);

    // --------------------------------------------------
    // 2. Número de factura
    // --------------------------------------------------

    const count = await this.facturaRepository.count({});
    const numeroFactura = count + 1;

    // --------------------------------------------------
    // 3. Generar CUF
    // --------------------------------------------------

    const cuf = this.getCuf({
      nit: cufd.nit,
      fechaHora: fechaHora.fechaHora,
      codigoModalidad: cufd.codigoModalidad,
      codigoSucursal: cufd.codigoSucursal,
      codigoPuntoVenta: cufd.codigoPuntoVenta,
      codigoControlCUFD: cufd.codigoControl,

      tipoDocumentoSector: tipoDocumentoSector,
      tipoEmision: tipoEmision,
      tipoFactura: tipoFactura,
      numeroFactura: numeroFactura,
    });

    // --------------------------------------------------
    // 4. Construcción del XML
    // --------------------------------------------------

    const xml = this.facturaBuilderService.buildFactura({
      nitEmisor: cufd.nit,
      razonSocialEmisor: data.razonSocialEmisor,
      municipio: data.municipio,
      telefono: data.telefono,

      numeroFactura: numeroFactura,
      cuf: cuf,
      cufd: cufd.codigo,
      codigoSucursal: cufd.codigoSucursal,
      direccion: cufd.direccion,
      codigoPuntoVenta: cufd.codigoPuntoVenta,
      fechaEmision: new Date(fechaHora.fechaHora),

      nombreRazonSocial: data.nombreRazonSocial,
      codigoTipoDocumentoIdentidad: data.codigoTipoDocumentoIdentidad,
      numeroDocumento: data.numeroDocumento,
      complemento: data.complemento,
      codigoCliente: data.codigoCliente,
      codigoMetodoPago: data.codigoMetodoPago,
      numeroTarjeta: data.numeroTarjeta,

      montoTotal: data.montoTotal,
      montoTotalSujetoIva: data.montoTotalSujetoIva,

      codigoMoneda: data.codigoMoneda,
      tipoCambio: data.tipoCambio,
      montoTotalMoneda: data.montoTotalMoneda,

      montoGiftCard: data.montoGiftCard,
      descuentoAdicional: data.descuentoAdicional,
      codigoExcepcion: data.codigoExcepcion,

      cafc: data.cafc,

      leyenda: data.leyenda,
      usuario: data.usuario,
      codigoDocumentoSector: data.codigoDocumentoSector,

      detalles: data.detalles,
    });

    // --------------------------------------------------
    // 5. Persistir factura
    // --------------------------------------------------

    const newFactura = this.facturaRepository.create({
      nitEmisor: cufd.nit,
      razonSocialEmisor: data.razonSocialEmisor,
      municipio: data.municipio,
      telefono: data.telefono,

      numeroFactura: numeroFactura,
      cuf: cuf,
      cufd: cufd.codigo,
      codigoSucursal: cufd.codigoSucursal,
      direccion: cufd.direccion,
      codigoPuntoVenta: cufd.codigoPuntoVenta,
      tipoFacturaDocumento: data.tipoFacturaDocumento,
      fechaEmision: new Date(fechaHora.fechaHora),

      nombreRazonSocial: data.nombreRazonSocial,
      codigoTipoDocumentoIdentidad: data.codigoTipoDocumentoIdentidad,
      numeroDocumento: data.numeroDocumento,
      complemento: data.complemento,
      codigoCliente: data.codigoCliente,
      codigoMetodoPago: data.codigoMetodoPago,
      numeroTarjeta: data.numeroTarjeta,

      montoTotal: data.montoTotal,
      montoTotalSujetoIva: data.montoTotalSujetoIva,

      codigoMoneda: data.codigoMoneda,
      tipoCambio: data.tipoCambio,
      montoTotalMoneda: data.montoTotalMoneda,

      montoGiftCard: data.montoGiftCard,
      descuentoAdicional: data.descuentoAdicional,
      codigoExcepcion: data.codigoExcepcion,

      cafc: data.cafc,

      leyenda: data.leyenda,
      usuario: data.usuario,
      codigoDocumentoSector: data.codigoDocumentoSector,

      estado: FacturaStatusEnum.PENDIENTE,
      codigoEmision: CodigoEmisionEnum.OFFLINE,

      xml,
    });
    return await this.facturaRepository.save(newFactura);
  }

  //? ============================================================================================== */
  //?                     Verificacion_Estado_Factura                                                */
  //? ============================================================================================== */

  async verificacionEstadoFactura(
    dto: VerificacionEstadoFacturaDto,
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

    const validacionEstadoFacturaResponse =
      await this.request.verificacionEstadoFactura({
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
        tipoFacturaDocumento: dto.codigoDocumentoSector,
        cuf: dto.cuf,
      });
    const response =
      validacionEstadoFacturaResponse.data.RespuestaServicioFacturacion;
    return response;
  }

  //? ============================================================================================== */
  //?                             Anulacion_Factura                                                  */
  //? ============================================================================================== */

  async anulacionFactura(dto: AnulacionFacturaDto, query: QueryDto) {
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

    const anulacionFacturaResponse: ResponseAnulacionFactura =
      await this.request.anulacionFactura({
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
        codigoMotivo: dto.codigoMotivo,
        cuf: dto.cuf,
      });
    const response = anulacionFacturaResponse.data.RespuestaServicioFacturacion;

    if (response.transaccion) {
      const factura = await this.facturaRepository.findOne({
        where: { cuf: dto.cuf },
      });
      if (factura)
        await this.facturaRepository.update(factura.id, {
          codigoDescripcion: response.codigoDescripcion,
          codigoEstado: response.codigoEstado,
          estado: FacturaStatusEnum.ANULADA,
        });
    }
    return response;
  }

  //? ============================================================================================== */
  //?                   Reversion_Anulacion_Factura                                                  */
  //? ============================================================================================== */

  async reversionAnulacionFactura(
    dto: ReversionAnulacionFacturaDto,
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

    const reversionAnulacionFacturaResponse: ResponseReversionAnulacionFactura =
      await this.request.reversionAnulacionFactura({
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
        cuf: dto.cuf,
      });
    const response =
      reversionAnulacionFacturaResponse.data.RespuestaServicioFacturacion;

    if (response.transaccion) {
      const factura = await this.facturaRepository.findOne({
        where: { cuf: dto.cuf },
      });
      if (factura)
        await this.facturaRepository.update(factura.id, {
          codigoDescripcion: response.codigoDescripcion,
          codigoEstado: response.codigoEstado,
          estado: FacturaStatusEnum.REVERTIDA,
        });
    }
    return response;
  }

  //? ============================================================================================== */
  //?                                       FindAll                                                  */
  //? ============================================================================================== */
  async FindAll() {
    return this.facturaRepository.find({ order: { fechaEmision: 'DESC' } });
  }

  //? ============================================================================================== */
  //?                                generador_CufD                                                  */
  //? ============================================================================================== */

  private getCuf(data: {
    nit: number;
    fechaHora: string;
    codigoModalidad: number;
    codigoSucursal: number;
    codigoPuntoVenta: number;
    codigoControlCUFD: string;

    tipoDocumentoSector: number;
    tipoEmision: number;
    tipoFactura: number;
    numeroFactura: number;
  }): string {
    const cuf = generarCUF({
      nit: data.nit,
      fechaHora: formatDateForCUF(new Date(data.fechaHora)),
      modalidad: data.codigoModalidad,
      codigoSucursal: data.codigoSucursal,
      codigoPuntoVenta: data.codigoPuntoVenta,

      tipoDocumentoSector: data.tipoDocumentoSector,
      tipoEmision: data.tipoEmision,
      tipoFactura: data.tipoFactura,
      numeroFactura: data.numeroFactura,
      codigoControlCUFD: data.codigoControlCUFD,
    });

    return cuf;
  }

  //? ============================================================================================== */
  //?                         generador_ArchivoHASH                                                  */
  //? ============================================================================================== */

  private generateArchivoHash(xml: string) {
    // 1. XML → Buffer
    const xmlBuffer = Buffer.from(xml, 'utf-8');
    // 2. Comprimir GZIP
    const gzipBuffer = zlib.gzipSync(xmlBuffer);
    // 3. Base64 (archivo)
    const archivo = gzipBuffer.toString('base64');
    // 4. Hash SHA-256
    const hashArchivo = algoritmoHash(gzipBuffer, 'sha256');

    return { archivo, hashArchivo };
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
