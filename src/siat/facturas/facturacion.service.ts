import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

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

import { CodigosService } from '../codigos/codigos.service';
import { ListasService } from '../catalogos/Listas.service';
import { FacturaBuilderService } from './services/factura-builder.service';
import { SincronizacionService } from '../catalogos/services/sincronizacion.service';
import { RequestsFacturacionService } from './services/requests-facturacion.service';

import { Factura } from './entities/factura.entity';
import { Detalle } from './entities/detalle.entity';
import { Cafc } from './entities/cafc.entity';

@Injectable()
export class FacturacionService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,

    @InjectRepository(Detalle)
    private readonly detalleRepository: Repository<Detalle>,

    @InjectRepository(Cafc)
    private readonly cafcRepository: Repository<Cafc>,

    private readonly codigosService: CodigosService,

    private readonly request: RequestsFacturacionService,

    private readonly facturaBuilderService: FacturaBuilderService,

    private readonly sincronizacionService: SincronizacionService,

    private readonly listasService: ListasService,
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
    const numeroTarjeta = this.mascararTarjeta(data.numeroTarjeta);

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

    const lastFactura = await this.facturaRepository.findOne({
      where: {
        codigoSucursal: cufd.codigoSucursal,
        codigoPuntoVenta: cufd.codigoPuntoVenta,
        cafc: IsNull(), // Excluir facturas de contingencia
      },
      order: {
        numeroFactura: 'DESC',
      },
    });

    const numeroFactura = (lastFactura?.numeroFactura || 0) + 1;

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
      if ((detalle.montoDescuento ?? 0) >= precioItem) {
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

    if (descuentoAdicional > sumaSubTotal) {
      throw new BadRequestException(
        'El descuento adicional no puede superar el monto total de los ítems',
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
      fechaEmision: fechaHora, //new Date(fechaHora),

      nombreRazonSocial: data.nombreRazonSocial,
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
      codigoExcepcion: data.codigoExcepcion,

      leyenda: leyendaObject.descripcionLeyenda,
      usuario: data.usuario,
      codigoDocumentoSector: data.codigoDocumentoSector,

      detalles: detallesCalculados,
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
      fechaEmision: fechaHora,

      nombreRazonSocial: data.nombreRazonSocial,
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
      codigoExcepcion: data.codigoExcepcion,

      leyenda: leyendaObject.descripcionLeyenda,
      usuario: data.usuario,
      codigoDocumentoSector: data.codigoDocumentoSector,

      estado: FacturaStatusEnum.PENDIENTE,
      codigoEmision: CodigoEmisionEnum.ONLINE,

      siatSync: siatSync,

      xml,

      detalles: detallesCalculados.map((detalle) =>
        this.detalleRepository.create({
          ...detalle,
        }),
      ),
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
        fechaEnvio: fechaHora.toString(),
        hashArchivo: hashArchivo,
      });
    const response = recepcionFacturaResponse.data.RespuestaServicioFacturacion;

    // --------------------------------------------------
    // 9. Guardar respuesta SIAT
    // --------------------------------------------------

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

    const { cufd } = await this.getCodigos({
      codigoPuntoVenta: query.codigoPuntoVenta,
      codigoSucursal: query.codigoSucursal,
    });
    const { tipoDocumentoSector, tipoEmision, tipoFactura, cafc, ...data } =
      dto;
    const numeroTarjeta = this.mascararTarjeta(data.numeroTarjeta);

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

    const lastFactura = await this.facturaRepository.findOne({
      where: { cafc: { codigo: cafc } },
      order: { numeroFactura: 'DESC' },
    });

    const numeroFactura = lastFactura
      ? lastFactura.numeroFactura + 1
      : cafcEntity.numeroInicial;

    if (numeroFactura > cafcEntity.numeroFinal) {
      throw new BadRequestException('Rango CAFC agotado');
    }

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
      if ((detalle.montoDescuento ?? 0) >= precioItem) {
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

    if (descuentoAdicional > sumaSubTotal) {
      throw new BadRequestException(
        'El descuento adicional no puede superar el monto total de los ítems',
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

      nombreRazonSocial: data.nombreRazonSocial,
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
      codigoExcepcion: data.codigoExcepcion,

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

      nombreRazonSocial: data.nombreRazonSocial,
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
      codigoExcepcion: data.codigoExcepcion,

      cafc: cafcEntity, //! CAFC

      leyenda: leyendaObject.descripcionLeyenda,
      usuario: data.usuario,
      codigoDocumentoSector: data.codigoDocumentoSector,

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
    return await this.facturaRepository.save(newFactura);
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

    const lastFactura = await this.facturaRepository.findOne({
      where: {
        codigoSucursal: cufd.codigoSucursal,
        codigoPuntoVenta: cufd.codigoPuntoVenta,
        cafc: IsNull(), // Excluir facturas de contingencia
      },
      order: {
        numeroFactura: 'DESC',
      },
    });

    const numeroFactura = (lastFactura?.numeroFactura || 0) + 1;
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
      if ((detalle.montoDescuento ?? 0) >= precioItem) {
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

    if (descuentoAdicional > sumaSubTotal) {
      throw new BadRequestException(
        'El descuento adicional no puede superar el monto total de los ítems',
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

      nombreRazonSocial: data.nombreRazonSocial,
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
      codigoExcepcion: data.codigoExcepcion,

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

      nombreRazonSocial: data.nombreRazonSocial,
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
      codigoExcepcion: data.codigoExcepcion,

      //cafc: data.cafc,

      leyenda: leyendaObject.descripcionLeyenda,
      usuario: data.usuario,
      codigoDocumentoSector: data.codigoDocumentoSector,

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
    return await this.facturaRepository.save(newFactura);
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
        codigoEmision: factura.codigoEmision,
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
      /* const factura = await this.facturaRepository.findOne({
        where: { cuf: dto.cuf },
      }); */
      //if (factura)
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
        codigoEmision: factura.codigoEmision,
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
      /* const factura = await this.facturaRepository.findOne({
        where: { cuf: dto.cuf },
      });
      if (factura) */
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

  /* private getCuf(data: {
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
  } */

  //? ============================================================================================== */
  //?                              Mascara_Tarjeta                                                    */
  //? ============================================================================================== */

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
