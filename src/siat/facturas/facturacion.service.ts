import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';

import * as zlib from 'zlib';

import { algoritmoHash } from '../helpers/functions';
import { generarCUF } from '../helpers/cuf.generator';
import { formatDateForCUF } from '../helpers/date.util';

import { ListasEnum } from '../catalogos/enums/listas.enum';
import { CodigoEmisionEnum } from './enums/codigo-emision.enum';
import { FacturaStatusEnum } from './enums/factura-status.enum';

import {
  CreateFacturaDto,
  AnulacionFacturaDto,
  VerificacionEstadoFacturaDto,
  ReversionAnulacionFacturaDto,
} from './dto';
import { QueryDto } from '../common/dto/query.dto';
import { CreateFacturaContingenciaDto } from './dto/create-factura-contingencia.dto';

import {
  ResponseRecepcionFactura,
  ResponseAnulacionFactura,
  ResponseReversionAnulacionFactura,
} from './interfaces';

import { MailService } from 'src/mail/mail.service';
import { CodigosService } from '../codigos/codigos.service';
import { ListasService } from '../catalogos/Listas.service';
import { FacturaPdfService } from './services/factura-pdf.service';
import { FacturaBuilderService } from './services/factura-builder.service';
import { SincronizacionService } from '../catalogos/services/sincronizacion.service';
import { RequestsFacturacionService } from './services/requests-facturacion.service';

import { Cafc } from './entities/cafc.entity';
import { Factura } from './entities/factura.entity';
import { Detalle } from './entities/detalle.entity';
import { Cufd } from '../codigos/entities/cufd.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import { FacturaCounter } from './entities/factura-counter.entity';

@Injectable()
export class FacturacionService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,

    @InjectRepository(Detalle)
    private readonly detalleRepository: Repository<Detalle>,

    @InjectRepository(Cafc)
    private readonly cafcRepository: Repository<Cafc>,

    @InjectRepository(Cufd)
    private readonly cufdRepository: Repository<Cufd>,

    private readonly codigosService: CodigosService,

    private readonly request: RequestsFacturacionService,

    private readonly facturaBuilderService: FacturaBuilderService,

    private readonly facturaPdfService: FacturaPdfService,

    private readonly sincronizacionService: SincronizacionService,

    private readonly listasService: ListasService,

    private readonly mailService: MailService,
  ) {}

  //? ============================================================================================== */
  //?                            Facturacion_Online                                                  */
  //? ============================================================================================== */

  async facturacionOnline(
    dto: CreateFacturaDto,
    query: QueryDto,
    order?: Order,
  ) {
    // --------------------------------------------------
    // 1. Obtener códigos vigentes
    // --------------------------------------------------

    const { cufd } = await this.getCodigos({
      codigoPuntoVenta: query.codigoPuntoVenta,
      codigoSucursal: query.codigoSucursal,
    });
    const { tipoDocumentoSector, tipoEmision, tipoFactura, ...data } = dto;
    const numeroTarjeta = this.mascararTarjeta(data.numeroTarjeta);
    const nombreRazonSocial = this.normalizarNombreRazonSocial(
      data.numeroDocumento,
      data.nombreRazonSocial,
    );

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
    // 2. Número de factura
    // --------------------------------------------------

    const numeroFactura = await this.getNextNumeroFactura(
      cufd.codigoSucursal,
      cufd.codigoPuntoVenta,
    );

    // --------------------------------------------------
    // 3. Generar CUF
    // --------------------------------------------------

    const cuf = generarCUF({
      nit: cufd.nit,
      fechaHora: formatDateForCUF(new Date(fechaHora)),
      modalidad: cufd.codigoModalidad,
      codigoSucursal: cufd.codigoSucursal,
      codigoPuntoVenta: cufd.codigoPuntoVenta,
      codigoControlCUFD: cufd.codigoControl,

      tipoDocumentoSector: tipoDocumentoSector,
      tipoEmision: tipoEmision,
      tipoFactura: tipoFactura,
      numeroFactura: numeroFactura,
    });

    // --------------------------------------------------
    // 5. Validaciones
    // --------------------------------------------------

    //! Calculo de detalles
    const detallesCalculados = data.detalles.map((item) => {
      const montoDescuento = item.montoDescuento ?? 0;
      const subTotal = item.cantidad * item.precioUnitario - montoDescuento;
      return {
        ...item,
        subTotal,
      };
    });

    for (const detalle of detallesCalculados) {
      if (detalle.cantidad <= 0) {
        throw new BadRequestException(
          `La cantidad del producto ${detalle.codigoProducto} debe ser mayor a 0`,
        );
      }
      const precioItem = detalle.cantidad * detalle.precioUnitario;
      if (precioItem > 0 && (detalle.montoDescuento ?? 0) >= precioItem) {
        throw new BadRequestException(
          `El descuento del producto '${detalle.codigoProducto}' no puede ser del 100% o superior`,
        );
      }
      if (detalle.subTotal <= 0) {
        throw new BadRequestException(
          `El subtotal del producto ${detalle.codigoProducto} debe ser mayor a 0`,
        );
      }
    }

    //! Calculo de montoTolta
    const sumaSubTotal = detallesCalculados.reduce(
      (acc, d) => acc + d.subTotal,
      0,
    );
    const descuentoAdicional = data.descuentoAdicional ?? 0;

    if (descuentoAdicional >= sumaSubTotal) {
      throw new BadRequestException(
        'El descuento adicional no puede igualar ni superar el monto total de los ítems',
      );
    }

    const montoTotal = sumaSubTotal - descuentoAdicional;

    //! Calculo de montoTotalMoneda
    const montoTotalMoneda = montoTotal / data.tipoCambio;

    //! Calculo de montoTotalSujetoIva
    let montoTotalSujetoIva = montoTotal;

    //!validar si el pago es con gifcard
    if (data.montoGiftCard) {
      if (data.montoGiftCard > montoTotal) {
        throw new BadRequestException(
          'El monto Gift Card no puede superar el monto total',
        );
      }
      montoTotalSujetoIva = montoTotal - data.montoGiftCard;
    }

    //! Leyenda aleatoria
    let leyendaObject: { codigoActividad: string; descripcionLeyenda: string } =
      { codigoActividad: '', descripcionLeyenda: '' };
    const listaLeyendas = await this.listasService.getLista(
      { metodo: ListasEnum.ListaLeyendasFactura },
      query,
    );
    if (listaLeyendas) {
      const lista =
        listaLeyendas?.listas[0].payload.RespuestaListaParametricasLeyendas
          .listaLeyendas;
      const randomIndex = Math.floor(Math.random() * lista.length);
      leyendaObject = lista[randomIndex];
    }

    // --------------------------------------------------
    // 5. Verificar comunicación con SIAT
    // --------------------------------------------------

    const siatDisponible = await this.request.verificarComunicacion();

    // --------------------------------------------------
    // 6. Construcción del XML
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
      fechaEmision: fechaHora,

      nombreRazonSocial,
      codigoTipoDocumentoIdentidad: data.codigoTipoDocumentoIdentidad,
      numeroDocumento: data.numeroDocumento,
      complemento: data.complemento,
      codigoCliente: data.codigoCliente,
      codigoMetodoPago: data.codigoMetodoPago,
      numeroTarjeta: numeroTarjeta,

      montoTotal: montoTotal,
      montoTotalSujetoIva: montoTotalSujetoIva,

      codigoMoneda: data.codigoMoneda,
      tipoCambio: data.tipoCambio,
      montoTotalMoneda: montoTotalMoneda,

      montoGiftCard: data.montoGiftCard,
      descuentoAdicional: data.descuentoAdicional,
      codigoExcepcion: this.calcularCodigoExcepcion(
        data.codigoTipoDocumentoIdentidad,
        data.numeroDocumento,
        !siatDisponible,
      ),

      leyenda: leyendaObject.descripcionLeyenda,
      usuario: data.usuario,
      codigoDocumentoSector: data.codigoDocumentoSector,

      detalles: detallesCalculados,
    });

    // --------------------------------------------------
    // 7. Generar archivo y hash
    // --------------------------------------------------

    const { archivo, hashArchivo } = this.generateArchivoHash(xml);

    // --------------------------------------------------
    // 8. Persistir factura con el código de emisión correcto
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
      fechaEmision: fechaHora,

      nombreRazonSocial,
      codigoTipoDocumentoIdentidad: data.codigoTipoDocumentoIdentidad,
      numeroDocumento: data.numeroDocumento,
      complemento: data.complemento,
      codigoCliente: data.codigoCliente,
      codigoMetodoPago: data.codigoMetodoPago,
      numeroTarjeta: numeroTarjeta,

      montoTotal: montoTotal,
      montoTotalSujetoIva: montoTotalSujetoIva,

      codigoMoneda: data.codigoMoneda,
      tipoCambio: data.tipoCambio,
      montoTotalMoneda: montoTotalMoneda,

      montoGiftCard: data.montoGiftCard,
      descuentoAdicional: data.descuentoAdicional,
      codigoExcepcion: this.calcularCodigoExcepcion(
        data.codigoTipoDocumentoIdentidad,
        data.numeroDocumento,
        !siatDisponible,
      ),

      leyenda: leyendaObject.descripcionLeyenda,
      usuario: data.usuario,
      codigoDocumentoSector: data.codigoDocumentoSector,

      emails: data.emails ?? null,

      estado: FacturaStatusEnum.PENDIENTE,
      codigoEmision: siatDisponible
        ? CodigoEmisionEnum.ONLINE
        : CodigoEmisionEnum.OFFLINE,

      siatSync: siatSync,

      xml,

      detalles: detallesCalculados.map((detalle) =>
        this.detalleRepository.create({
          ...detalle,
        }),
      ),

      //order: order ?? null,
    });
    const factura = await this.facturaRepository.save(newFactura);

    if (!siatDisponible) {
      return factura;
    }

    // --------------------------------------------------
    // 9. Envío a SIAT (Etapa IV – Emisión Individual)
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
        fechaEnvio: fechaHora.toString(),
        hashArchivo: hashArchivo,
      });

    // --------------------------------------------------
    // 10. Guardar respuesta SIAT
    // --------------------------------------------------

    if (!recepcionFacturaResponse.success) {
      await this.facturaRepository.update(factura.id, {
        codigoEmision: CodigoEmisionEnum.OFFLINE,
      });
      return null;
    }

    const response = recepcionFacturaResponse.data.RespuestaServicioFacturacion;

    if (response) {
      await this.facturaRepository.update(factura.id, {
        codigoDescripcion: response.codigoDescripcion,
        codigoEstado: response.codigoEstado,
        codigoRecepcion: response.codigoRecepcion ?? null,
        transaccion: response.transaccion,
        mensajesList: response.mensajesList ?? null,
        fechaRespuesta: recepcionFacturaResponse.timestamp,
        estado: response.codigoDescripcion as FacturaStatusEnum,
      });

      if (data.emails?.length && response.transaccion) {
        const xmlBuffer = Buffer.from(factura.xml, 'utf-8');
        const pdfBuffer = await this.facturaPdfService.generate(factura);
        await this.mailService.sendFacturaEmail(
          data.emails,
          factura.numeroFactura,
          factura.razonSocialEmisor,
          xmlBuffer,
          pdfBuffer,
        );
      }

      return response;
    } else {
      await this.facturaRepository.update(factura.id, {
        codigoEmision: CodigoEmisionEnum.OFFLINE,
      });

      return response;
    }
  }

  //? ============================================================================================== */
  //?               Facturacion_Online_Contingencia                                                  */
  //? ============================================================================================== */

  async facturacionOfflineContingencia(
    dto: CreateFacturaContingenciaDto,
    query: QueryDto,
  ) {
    // --------------------------------------------------
    // 1. Obtener códigos vigentes
    // --------------------------------------------------

    const {
      tipoDocumentoSector,
      tipoEmision,
      tipoFactura,
      cafc,
      cufdId,
      ...data
    } = dto;

    const cufd = await this.cufdRepository.findOne({
      where: {
        id: cufdId,
        codigoPuntoVenta: query.codigoPuntoVenta,
        codigoSucursal: query.codigoSucursal,
      },
    });

    if (!cufd) {
      throw new BadRequestException(
        'CUFD no encontrado para la sucursal y punto de venta indicados',
      );
    }
    const numeroTarjeta = this.mascararTarjeta(data.numeroTarjeta);
    const nombreRazonSocial = this.normalizarNombreRazonSocial(
      data.numeroDocumento,
      data.nombreRazonSocial,
    );

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
    // 2. Número de factura
    // --------------------------------------------------

    const cafcEntity = await this.cafcRepository.findOne({
      where: { codigo: cafc },
    });

    if (!cafcEntity) {
      throw new BadRequestException('CAFC no válido');
    }

    const numeroFactura = await this.getNextNumeroFacturaCafc(cafcEntity.id);

    // --------------------------------------------------
    // 3. Generar CUF
    // --------------------------------------------------

    const cuf = generarCUF({
      nit: cufd.nit,
      fechaHora: formatDateForCUF(new Date(fechaHora)), // fechaHora.toString(),
      modalidad: cufd.codigoModalidad,
      codigoSucursal: cufd.codigoSucursal,
      codigoPuntoVenta: cufd.codigoPuntoVenta,
      codigoControlCUFD: cufd.codigoControl,

      tipoDocumentoSector: tipoDocumentoSector,
      tipoEmision: tipoEmision,
      tipoFactura: tipoFactura,
      numeroFactura: numeroFactura,
    });

    // --------------------------------------------------
    // 5. Validaciones
    // --------------------------------------------------

    //! Calculo de detalles
    const detallesCalculados = data.detalles.map((item) => {
      const montoDescuento = item.montoDescuento ?? 0;
      const subTotal = item.cantidad * item.precioUnitario - montoDescuento;
      return {
        ...item,
        subTotal,
      };
    });

    for (const detalle of detallesCalculados) {
      if (detalle.cantidad <= 0) {
        throw new BadRequestException(
          `La cantidad del producto ${detalle.codigoProducto} debe ser mayor a 0`,
        );
      }
      const precioItem = detalle.cantidad * detalle.precioUnitario;
      if (precioItem > 0 && (detalle.montoDescuento ?? 0) >= precioItem) {
        throw new BadRequestException(
          `El descuento del producto '${detalle.codigoProducto}' no puede ser del 100% o superior`,
        );
      }
      if (detalle.subTotal <= 0) {
        throw new BadRequestException(
          `El subtotal del producto ${detalle.codigoProducto} debe ser mayor a 0`,
        );
      }
    }

    //! Calculo de montoTolta
    const sumaSubTotal = detallesCalculados.reduce(
      (acc, d) => acc + d.subTotal,
      0,
    );
    const descuentoAdicional = data.descuentoAdicional ?? 0;

    if (descuentoAdicional >= sumaSubTotal) {
      throw new BadRequestException(
        'El descuento adicional no puede igualar ni superar el monto total de los ítems',
      );
    }

    const montoTotal = sumaSubTotal - descuentoAdicional;

    //! Calculo de montoTotalMoneda
    const montoTotalMoneda = montoTotal / data.tipoCambio;

    //! Calculo de montoTotalSujetoIva
    let montoTotalSujetoIva = montoTotal;

    //!validar si el pago es con gifcard
    if (data.montoGiftCard) {
      if (data.montoGiftCard > montoTotal) {
        throw new BadRequestException(
          'El monto Gift Card no puede superar el monto total',
        );
      }
      montoTotalSujetoIva = montoTotal - data.montoGiftCard;
    }

    //! Leyenda aleatoria
    let leyendaObject: { codigoActividad: string; descripcionLeyenda: string } =
      { codigoActividad: '', descripcionLeyenda: '' };

    const listaLeyendas = await this.listasService.getLista(
      { metodo: ListasEnum.ListaLeyendasFactura },
      query,
    );
    if (listaLeyendas) {
      const lista =
        listaLeyendas?.listas[0].payload.RespuestaListaParametricasLeyendas
          .listaLeyendas;
      const randomIndex = Math.floor(Math.random() * lista.length);
      leyendaObject = lista[randomIndex];
    }

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
      fechaEmision: fechaHora, // new Date(fechaHora),

      nombreRazonSocial,
      codigoTipoDocumentoIdentidad: data.codigoTipoDocumentoIdentidad,
      numeroDocumento: data.numeroDocumento,
      complemento: data.complemento,
      codigoCliente: data.codigoCliente,
      codigoMetodoPago: data.codigoMetodoPago,
      numeroTarjeta: numeroTarjeta,

      montoTotal: montoTotal,
      montoTotalSujetoIva: montoTotalSujetoIva,

      codigoMoneda: data.codigoMoneda,
      tipoCambio: data.tipoCambio,
      montoTotalMoneda: montoTotalMoneda,

      montoGiftCard: data.montoGiftCard,
      descuentoAdicional: data.descuentoAdicional,
      codigoExcepcion: this.calcularCodigoExcepcion(
        data.codigoTipoDocumentoIdentidad,
        data.numeroDocumento,
        true,
      ),

      cafc: cafcEntity.codigo, //! CAFC

      leyenda: leyendaObject.descripcionLeyenda,
      usuario: data.usuario,
      codigoDocumentoSector: data.codigoDocumentoSector,

      detalles: detallesCalculados,
    });

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
      fechaEmision: fechaHora,

      nombreRazonSocial,
      codigoTipoDocumentoIdentidad: data.codigoTipoDocumentoIdentidad,
      numeroDocumento: data.numeroDocumento,
      complemento: data.complemento,
      codigoCliente: data.codigoCliente,
      codigoMetodoPago: data.codigoMetodoPago,
      numeroTarjeta: numeroTarjeta,

      montoTotal: montoTotal,
      montoTotalSujetoIva: montoTotalSujetoIva,

      codigoMoneda: data.codigoMoneda,
      tipoCambio: data.tipoCambio,
      montoTotalMoneda: montoTotalMoneda,

      montoGiftCard: data.montoGiftCard,
      descuentoAdicional: data.descuentoAdicional,
      codigoExcepcion: this.calcularCodigoExcepcion(
        data.codigoTipoDocumentoIdentidad,
        data.numeroDocumento,
        true,
      ),

      cafc: cafcEntity, //! CAFC

      leyenda: leyendaObject.descripcionLeyenda,
      usuario: data.usuario,
      codigoDocumentoSector: data.codigoDocumentoSector,

      emails: data.emails ?? null,

      estado: FacturaStatusEnum.PENDIENTE,
      codigoEmision: CodigoEmisionEnum.OFFLINE, //! offline

      siatSync: siatSync,

      xml,

      detalles: detallesCalculados.map((detalle) =>
        this.detalleRepository.create({
          ...detalle,
        }),
      ),
    });
    const factura = await this.facturaRepository.save(newFactura);

    if (data.emails?.length) {
      const xmlBuffer = Buffer.from(factura.xml, 'utf-8');
      const pdfBuffer = await this.facturaPdfService.generate(factura);
      await this.mailService.sendFacturaEmail(
        data.emails,
        factura.numeroFactura,
        factura.razonSocialEmisor,
        xmlBuffer,
        pdfBuffer,
      );
    }

    return factura;
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
    const numeroTarjeta = this.mascararTarjeta(data.numeroTarjeta);
    const nombreRazonSocial = this.normalizarNombreRazonSocial(
      data.numeroDocumento,
      data.nombreRazonSocial,
    );

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
    // 2. Número de factura
    // --------------------------------------------------

    const numeroFactura = await this.getNextNumeroFactura(
      cufd.codigoSucursal,
      cufd.codigoPuntoVenta,
    );

    // --------------------------------------------------
    // 3. Generar CUF
    // --------------------------------------------------

    const cuf = generarCUF({
      nit: cufd.nit,
      fechaHora: formatDateForCUF(new Date(fechaHora)),
      modalidad: cufd.codigoModalidad,
      codigoSucursal: cufd.codigoSucursal,
      codigoPuntoVenta: cufd.codigoPuntoVenta,
      codigoControlCUFD: cufd.codigoControl,

      tipoDocumentoSector: tipoDocumentoSector,
      tipoEmision: tipoEmision,
      tipoFactura: tipoFactura,
      numeroFactura: numeroFactura,
    });

    // --------------------------------------------------
    // 4. Validaciones
    // --------------------------------------------------

    //! Calculo de detalles
    const detallesCalculados = data.detalles.map((item) => {
      const montoDescuento = item.montoDescuento ?? 0;
      const subTotal = item.cantidad * item.precioUnitario - montoDescuento;
      return {
        ...item,
        subTotal,
      };
    });

    for (const detalle of detallesCalculados) {
      if (detalle.cantidad <= 0) {
        throw new BadRequestException(
          `La cantidad del producto ${detalle.codigoProducto} debe ser mayor a 0`,
        );
      }
      const precioItem = detalle.cantidad * detalle.precioUnitario;
      if (precioItem > 0 && (detalle.montoDescuento ?? 0) >= precioItem) {
        throw new BadRequestException(
          `El descuento del producto '${detalle.codigoProducto}' no puede ser del 100% o superior`,
        );
      }
      if (detalle.subTotal <= 0) {
        throw new BadRequestException(
          `El subtotal del producto ${detalle.codigoProducto} debe ser mayor a 0`,
        );
      }
    }

    //! Calculo de montoTolta
    const sumaSubTotal = detallesCalculados.reduce(
      (acc, d) => acc + d.subTotal,
      0,
    );
    const descuentoAdicional = data.descuentoAdicional ?? 0;

    if (descuentoAdicional >= sumaSubTotal) {
      throw new BadRequestException(
        'El descuento adicional no puede igualar ni superar el monto total de los ítems',
      );
    }

    const montoTotal = sumaSubTotal - descuentoAdicional;

    //! Calculo de montoTotalMoneda
    const montoTotalMoneda = montoTotal / data.tipoCambio;

    //! Calculo de montoTotalSujetoIva
    let montoTotalSujetoIva = montoTotal;

    //!validar si el pago es con gifcard
    if (data.montoGiftCard) {
      if (data.montoGiftCard > montoTotal) {
        throw new BadRequestException(
          'El monto Gift Card no puede superar el monto total',
        );
      }
      montoTotalSujetoIva = montoTotal - data.montoGiftCard;
    }

    //! Leyenda aleatoria
    let leyendaObject: { codigoActividad: string; descripcionLeyenda: string } =
      { codigoActividad: '', descripcionLeyenda: '' };

    const listaLeyendas = await this.listasService.getLista(
      { metodo: ListasEnum.ListaLeyendasFactura },
      query,
    );

    if (listaLeyendas) {
      const lista =
        listaLeyendas?.listas[0].payload.RespuestaListaParametricasLeyendas
          .listaLeyendas;

      const randomIndex = Math.floor(Math.random() * lista.length);
      leyendaObject = lista[randomIndex];
    }

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
      fechaEmision: fechaHora, // new Date(fechaHora),

      nombreRazonSocial,
      codigoTipoDocumentoIdentidad: data.codigoTipoDocumentoIdentidad,
      numeroDocumento: data.numeroDocumento,
      complemento: data.complemento,
      codigoCliente: data.codigoCliente,
      codigoMetodoPago: data.codigoMetodoPago,
      numeroTarjeta: numeroTarjeta,

      montoTotal: montoTotal,
      montoTotalSujetoIva: montoTotalSujetoIva,

      codigoMoneda: data.codigoMoneda,
      tipoCambio: data.tipoCambio,
      montoTotalMoneda: montoTotalMoneda,

      montoGiftCard: data.montoGiftCard,
      descuentoAdicional: data.descuentoAdicional,
      codigoExcepcion: this.calcularCodigoExcepcion(
        data.codigoTipoDocumentoIdentidad,
        data.numeroDocumento,
        true,
      ),

      //cafc: data.cafc,

      leyenda: leyendaObject.descripcionLeyenda,
      usuario: data.usuario,
      codigoDocumentoSector: data.codigoDocumentoSector,

      detalles: detallesCalculados,
    });

    // --------------------------------------------------
    // 5. Persistir factura
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
      fechaEmision: fechaHora,

      nombreRazonSocial,
      codigoTipoDocumentoIdentidad: data.codigoTipoDocumentoIdentidad,
      numeroDocumento: data.numeroDocumento,
      complemento: data.complemento,
      codigoCliente: data.codigoCliente,
      codigoMetodoPago: data.codigoMetodoPago,
      numeroTarjeta: numeroTarjeta,

      montoTotal: montoTotal,
      montoTotalSujetoIva: montoTotalSujetoIva,

      codigoMoneda: data.codigoMoneda,
      tipoCambio: data.tipoCambio,
      montoTotalMoneda: montoTotalMoneda,

      montoGiftCard: data.montoGiftCard,
      descuentoAdicional: data.descuentoAdicional,
      codigoExcepcion: this.calcularCodigoExcepcion(
        data.codigoTipoDocumentoIdentidad,
        data.numeroDocumento,
        true,
      ),

      leyenda: leyendaObject.descripcionLeyenda,
      usuario: data.usuario,
      codigoDocumentoSector: data.codigoDocumentoSector,

      emails: data.emails ?? null,

      estado: FacturaStatusEnum.PENDIENTE,
      codigoEmision: CodigoEmisionEnum.OFFLINE,

      siatSync: siatSync,

      xml,

      detalles: detallesCalculados.map((detalle) =>
        this.detalleRepository.create({
          ...detalle,
        }),
      ),
    });
    const factura = await this.facturaRepository.save(newFactura);

    if (data.emails?.length) {
      const xmlBuffer = Buffer.from(factura.xml, 'utf-8');
      const pdfBuffer = await this.facturaPdfService.generate(factura);
      await this.mailService.sendFacturaEmail(
        data.emails,
        factura.numeroFactura,
        factura.razonSocialEmisor,
        xmlBuffer,
        pdfBuffer,
      );
    }

    return factura;
  }

  //? ============================================================================================== */
  //?                        Facturacion_Offline_Lote                                                */
  //? ============================================================================================== */

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async facturacionOfflineLote(dto: CreateFacturaDto, query: QueryDto) {
    const resultados: any[] = [];
    const total = 44;

    // Ajusta según SIAT (ej. 100–500 ms suele ser suficiente)
    const delayMs = 300;

    for (let i = 1; i <= total; i++) {
      try {
        const respuesta = await this.facturacionOffline(dto, query); //! cambiar para las pruebas

        resultados.push({
          numero: i,
          success: true,
          data: respuesta,
        });
      } catch (error) {
        resultados.push({
          numero: i,
          success: false,
          error: error?.response || error?.message,
        });
      }

      // Evita delay después de la última factura
      if (i < total) {
        await this.sleep(delayMs);
      }
    }

    return {
      total,
      exitosas: resultados.filter((r) => r.success).length,
      fallidas: resultados.filter((r) => !r.success).length,
    };
  }

  //? ============================================================================================== */
  //?                     Verificacion_Estado_Factura                                                */
  //? ============================================================================================== */

  async verificacionEstadoFactura(dto: VerificacionEstadoFacturaDto) {
    const factura = await this.facturaRepository.findOne({
      where: { id: dto.facturaId },
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    const { cufd } = await this.getCodigos({
      codigoPuntoVenta: factura.codigoPuntoVenta,
      codigoSucursal: factura.codigoSucursal,
    });

    const validacionEstadoFacturaResponse =
      await this.request.verificacionEstadoFactura({
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
        cuf: factura.cuf,
      });

    return validacionEstadoFacturaResponse.data.RespuestaServicioFacturacion;
  }

  //? ============================================================================================== */
  //?                             Anulacion_Factura                                                  */
  //? ============================================================================================== */

  async anulacionFactura(dto: AnulacionFacturaDto /*query: QueryDto */) {
    // --------------------------------------------------
    // 1. Obtener códigos vigentes
    // --------------------------------------------------

    const { facturaId } = dto;

    const factura = await this.facturaRepository.findOne({
      where: { id: facturaId, estado: FacturaStatusEnum.VALIDADA },
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    const { cufd } = await this.getCodigos({
      codigoPuntoVenta: factura.codigoPuntoVenta,
      codigoSucursal: factura.codigoSucursal,
    });

    // --------------------------------------------------
    // 2. Request
    // --------------------------------------------------

    const anulacionFacturaResponse: ResponseAnulacionFactura =
      await this.request.anulacionFactura({
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
        codigoMotivo: dto.codigoMotivo,
        cuf: factura.cuf,
      });
    const response = anulacionFacturaResponse.data.RespuestaServicioFacturacion;

    if (response.transaccion) {
      await this.facturaRepository.update(factura.id, {
        codigoDescripcion: response.codigoDescripcion,
        codigoEstado: response.codigoEstado,
        estado: FacturaStatusEnum.ANULADA,
      });

      if (factura.emails?.length) {
        await this.mailService.sendAnulacionEmail(
          factura.emails,
          factura.numeroFactura,
        );
      }
    }
    return response;
  }

  //? ============================================================================================== */
  //?                   Reversion_Anulacion_Factura                                                  */
  //? ============================================================================================== */

  async reversionAnulacionFactura(dto: ReversionAnulacionFacturaDto) {
    // --------------------------------------------------
    // 1. Obtener códigos vigentes
    // --------------------------------------------------

    const { facturaId } = dto;

    const factura = await this.facturaRepository.findOne({
      where: { id: facturaId, estado: FacturaStatusEnum.ANULADA },
    });

    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }

    const { cufd } = await this.getCodigos({
      codigoPuntoVenta: factura.codigoPuntoVenta,
      codigoSucursal: factura.codigoSucursal,
    });

    // --------------------------------------------------
    // 2. Request
    // --------------------------------------------------

    const reversionAnulacionFacturaResponse: ResponseReversionAnulacionFactura =
      await this.request.reversionAnulacionFactura({
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
        cuf: factura.cuf,
      });
    const response =
      reversionAnulacionFacturaResponse.data.RespuestaServicioFacturacion;

    if (response.transaccion) {
      await this.facturaRepository.update(factura.id, {
        codigoDescripcion: response.codigoDescripcion,
        codigoEstado: response.codigoEstado,
        estado: FacturaStatusEnum.REVERTIDA,
      });

      if (factura.emails?.length) {
        await this.mailService.sendReversionEmail(
          factura.emails,
          factura.numeroFactura,
        );
      }
    }
    return response;
  }

  //? ============================================================================================== */
  //?                                  Enviar_Email_Factura                                          */
  //? ============================================================================================== */

  /*  async sendFacturaEmail(dto: SendFacturaEmailDto) {
    const factura = await this.facturaRepository.findOne({
      where: { id: dto.facturaId },
      relations: ['detalles'],
    });

    if (!factura) {
      throw new NotFoundException(
        `Factura con id ${dto.facturaId} no encontrada`,
      );
    }

    if (!factura.xml) {
      throw new BadRequestException('La factura no tiene XML generado');
    }

    const xmlBuffer = Buffer.from(factura.xml, 'utf-8');
    const pdfBuffer = await this.facturaPdfService.generate(factura);

    await this.mailService.sendFacturaEmail(
      dto.email,
      factura.numeroFactura,
      factura.razonSocialEmisor,
      xmlBuffer,
      pdfBuffer,
    );

    return {
      message: `Factura N° ${factura.numeroFactura} enviada a ${dto.email}`,
    };
  } */

  //? ============================================================================================== */
  //?                              Enviar_Email_Paquete                                              */
  //? ============================================================================================== */

  /* async sendPaqueteEmail(dto: SendPaqueteEmailDto) {
    const paquete = await this.paqueteRepository.findOne({
      where: { id: dto.paqueteId },
      relations: ['facturas', 'facturas.detalles'],
    });

    if (!paquete) {
      throw new NotFoundException(
        `Paquete con id ${dto.paqueteId} no encontrado`,
      );
    }

    if (!paquete.facturas?.length) {
      throw new BadRequestException('El paquete no tiene facturas asociadas');
    }

    const attachments = await Promise.all(
      paquete.facturas.map(async (factura) => {
        if (!factura.xml) {
          throw new BadRequestException(
            `La factura N° ${factura.numeroFactura} no tiene XML generado`,
          );
        }
        const pdfBuffer = await this.facturaPdfService.generate(factura);
        const xmlBuffer = Buffer.from(factura.xml, 'utf-8');
        return { numeroFactura: factura.numeroFactura, pdfBuffer, xmlBuffer };
      }),
    );

    await this.mailService.sendPaqueteEmail(
      dto.email,
      paquete.id,
      paquete.facturas[0].razonSocialEmisor,
      attachments,
    );

    return {
      message: `Paquete N° ${paquete.id} enviado a ${dto.email} (${attachments.length} facturas)`,
    };
  } */

  //? ============================================================================================== */
  //?                           Enviar_Email_Anulacion                                               */
  //? ============================================================================================== */

  /*  async sendAnulacionEmail(dto: SendAnulacionEmailDto) {
    const facturas = await this.facturaRepository.findByIds(dto.facturaIds);

    if (!facturas.length) {
      throw new NotFoundException(
        'No se encontraron facturas con los IDs proporcionados',
      );
    }

    await Promise.all(
      facturas.map((f) =>
        this.mailService.sendAnulacionEmail(dto.email, f.numeroFactura),
      ),
    );

    return {
      message: `Notificación de anulación enviada a ${dto.email} (${facturas.length} facturas)`,
    };
  } */

  //? ============================================================================================== */
  //?                           Enviar_Email_Reversion                                               */
  //? ============================================================================================== */

  /* async sendReversionEmail(dto: SendReversionEmailDto) {
    const facturas = await this.facturaRepository.findByIds(dto.facturaIds);

    if (!facturas.length) {
      throw new NotFoundException(
        'No se encontraron facturas con los IDs proporcionados',
      );
    }

    await Promise.all(
      facturas.map((f) =>
        this.mailService.sendReversionEmail(dto.email, f.numeroFactura),
      ),
    );

    return {
      message: `Notificación de reversión enviada a ${dto.email} (${facturas.length} facturas)`,
    };
  }
 */
  //? ============================================================================================== */
  //?                                       FindAll                                                  */
  //? ============================================================================================== */
  async FindAll() {
    return this.facturaRepository.find({ order: { fechaEmision: 'DESC' } });
  }

  //? ============================================================================================== */
  //?                              Find_Factura_By_Order_Id                                          */
  //? ============================================================================================== */
  /* async findFacturaByOrderId(orderId: number) {
    return this.facturaRepository.findOne({
      where: { order: { id: orderId } },
    });
  } */

  //? ============================================================================================== */
  //?                          Representacion_Grafica_Factura (PDF)                                  */
  //? ============================================================================================== */

  async getRepresentacionGrafica(facturaId: number): Promise<{
    pdfBuffer: Buffer;
    numeroFactura: number;
  }> {
    const factura = await this.facturaRepository.findOne({
      where: { id: facturaId },
      relations: ['detalles', 'cafc'],
    });

    if (!factura) {
      throw new NotFoundException(`Factura con id ${facturaId} no encontrada`);
    }

    const pdfBuffer = await this.facturaPdfService.generate(factura);

    return { pdfBuffer, numeroFactura: factura.numeroFactura };
  }

  //? ============================================================================================== */
  //?                         Numero_Factura_Atomico                                                  */
  //? ============================================================================================== */

  private async getNextNumeroFactura(
    codigoSucursal: number,
    codigoPuntoVenta: number,
  ): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      // Garantiza que la fila existe antes de bloquearla.
      // ON CONFLICT DO NOTHING es atómico: si dos peticiones llegan al mismo
      // tiempo, exactamente una crea la fila y la otra no hace nada.
      await manager
        .createQueryBuilder()
        .insert()
        .into(FacturaCounter)
        .values({ codigoSucursal, codigoPuntoVenta, ultimoNumero: 0 })
        .orIgnore()
        .execute();

      const counter = await manager.findOneOrFail(FacturaCounter, {
        where: { codigoSucursal, codigoPuntoVenta },
        lock: { mode: 'pessimistic_write' },
      });

      if (counter.ultimoNumero === 0) {
        // Primera factura: inicializa desde el máximo real en BD
        const lastFactura = await manager.findOne(Factura, {
          where: { codigoSucursal, codigoPuntoVenta, cafc: IsNull() },
          order: { numeroFactura: 'DESC' },
        });
        counter.ultimoNumero = (lastFactura?.numeroFactura ?? 0) + 1;
      } else {
        counter.ultimoNumero += 1;
      }

      await manager.save(FacturaCounter, counter);
      return counter.ultimoNumero;
    });
  }

  private async getNextNumeroFacturaCafc(cafcId: number): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      const cafc = await manager.findOne(Cafc, {
        where: { id: cafcId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!cafc) {
        throw new BadRequestException('CAFC no válido');
      }

      const siguiente =
        cafc.ultimoNumero === null
          ? Number(cafc.numeroInicial)
          : Number(cafc.ultimoNumero) + 1;

      if (siguiente > Number(cafc.numeroFinal)) {
        throw new BadRequestException('Rango CAFC agotado');
      }

      cafc.ultimoNumero = siguiente;
      await manager.save(Cafc, cafc);
      return siguiente;
    });
  }

  //? ============================================================================================== */
  //?                              Mascara_Tarjeta                                                   */
  //? ============================================================================================== */

  private calcularCodigoExcepcion(
    codigoTipoDocumentoIdentidad: number,
    numeroDocumento: string,
    esOffline: boolean,
  ): number {
    const NITS_ESPECIALES = ['99001', '99002', '99003'];
    if (codigoTipoDocumentoIdentidad !== 5) return 0;
    if (NITS_ESPECIALES.includes(numeroDocumento)) return 1;
    if (esOffline) return 1;
    return 0;
  }

  //? ============================================================================================== */
  //?                      Nombre_Razon_Social_NIT_Especiales                                        */
  //? ============================================================================================== */

  //! RND: Nombre/Razón Social obligatorio según NIT/CI especial consignado
  private static readonly NOMBRE_RAZON_SOCIAL_POR_NIT_ESPECIAL: Record<
    string,
    string
  > = {
    '99002': 'Control Tributario',
    '99003': 'VENTAS MENORES DEL DÍA',
  };

  private normalizarNombreRazonSocial(
    numeroDocumento: string,
    nombreRazonSocial: string,
  ): string {
    return (
      FacturacionService.NOMBRE_RAZON_SOCIAL_POR_NIT_ESPECIAL[
        numeroDocumento
      ] ?? nombreRazonSocial
    );
  }

  private mascararTarjeta(numeroTarjeta?: string | null): string | null {
    if (!numeroTarjeta) return null;
    return (
      numeroTarjeta.slice(0, 4) +
      '0'.repeat(numeroTarjeta.length - 8) +
      numeroTarjeta.slice(-4)
    );
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
