import { Injectable } from '@nestjs/common';
import { FacturaInterface } from '../interfaces/factura.interface';
import { create } from 'xmlbuilder2';
import { formatDateISO } from '../../helpers/date.util';

@Injectable()
export class FacturaBuilderService {
  buildFactura(data: FacturaInterface): string {
    const root = create({ version: '1.0', encoding: 'UTF-8' }).ele(
      'facturaComputarizadaCompraVenta',
      {
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:noNamespaceSchemaLocation': 'facturaComputarizadaCompraVenta.xsd',
      },
    );

    //* CABECERA
    const cabecera = root.ele('cabecera');

    //* Información del Emisor
    cabecera.ele('nitEmisor').txt(data.nitEmisor.toString()).up();
    cabecera.ele('razonSocialEmisor').txt(data.razonSocialEmisor).up();
    cabecera.ele('municipio').txt(data.municipio).up();
    cabecera.ele('telefono').txt(data.telefono).up();

    //* Información de la Factura
    cabecera.ele('numeroFactura').txt(data.numeroFactura.toString()).up();
    cabecera.ele('cuf').txt(data.cuf).up();
    cabecera.ele('cufd').txt(data.cufd).up();
    cabecera.ele('codigoSucursal').txt(data.codigoSucursal.toString()).up();
    cabecera.ele('direccion').txt(data.direccion).up();
    cabecera.ele('codigoPuntoVenta').txt(data.codigoPuntoVenta.toString()).up();
    cabecera.ele('fechaEmision').txt(data.fechaEmision).up();

    //* Información del Cliente
    cabecera.ele('nombreRazonSocial').txt(data.nombreRazonSocial).up();
    cabecera
      .ele('codigoTipoDocumentoIdentidad')
      .txt(data.codigoTipoDocumentoIdentidad.toString())
      .up();
    cabecera.ele('numeroDocumento').txt(data.numeroDocumento).up();

    // complemento (opcional)
    if (data.complemento !== undefined && data.complemento !== null) {
      cabecera.ele('complemento').txt(data.complemento).up();
    } else {
      cabecera.ele('complemento', { 'xsi:nil': 'true' }).up();
    }

    cabecera.ele('codigoCliente').txt(data.codigoCliente).up();
    cabecera.ele('codigoMetodoPago').txt(data.codigoMetodoPago.toString()).up();

    // numeroTarjeta (opcional)
    if (data.numeroTarjeta !== undefined && data.numeroTarjeta !== null) {
      cabecera.ele('numeroTarjeta').txt(data.numeroTarjeta).up();
    } else {
      cabecera.ele('numeroTarjeta', { 'xsi:nil': 'true' }).up();
    }

    //* Montos
    cabecera.ele('montoTotal').txt(data.montoTotal.toFixed(2)).up();
    cabecera
      .ele('montoTotalSujetoIva')
      .txt(data.montoTotalSujetoIva.toFixed(2))
      .up();

    //* Moneda
    cabecera.ele('codigoMoneda').txt(data.codigoMoneda.toString()).up();
    cabecera.ele('tipoCambio').txt(data.tipoCambio.toString()).up();
    cabecera.ele('montoTotalMoneda').txt(data.montoTotal.toFixed(2)).up();

    // montoGiftCard (opcional)
    if (data.montoGiftCard !== undefined && data.montoGiftCard !== null) {
      cabecera.ele('montoGiftCard').txt(data.montoGiftCard.toString()).up();
    } else {
      cabecera.ele('montoGiftCard', { 'xsi:nil': 'true' }).up();
    }

    // descuentoAdicional (opcional)
    if (
      data.descuentoAdicional !== undefined &&
      data.descuentoAdicional !== null
    ) {
      cabecera
        .ele('descuentoAdicional')
        .txt(data.descuentoAdicional.toString())
        .up();
    } else {
      cabecera.ele('descuentoAdicional', { 'xsi:nil': 'true' }).up();
    }

    // codigoExcepcion (opcional)
    if (data.codigoExcepcion !== undefined && data.codigoExcepcion !== null) {
      cabecera.ele('codigoExcepcion').txt(data.codigoExcepcion.toString()).up();
    } else {
      cabecera.ele('codigoExcepcion', { 'xsi:nil': 'true' }).up();
    }

    // cafc (opcional)
    if (data.cafc !== undefined && data.cafc !== null) {
      cabecera.ele('cafc').txt(data.cafc.toString()).up();
    } else {
      cabecera.ele('cafc', { 'xsi:nil': 'true' }).up();
    }

    cabecera.ele('leyenda').txt(data.leyenda).up();
    cabecera.ele('usuario').txt(data.usuario).up();
    cabecera
      .ele('codigoDocumentoSector')
      .txt(data.codigoDocumentoSector.toString())
      .up();

    //* Cerrar cabecera (no es necesario hacer .up() explícito porque ya estamos fuera)

    //* DETALLES
    data.detalles.forEach((d) => {
      const detalleElement = root.ele('detalle');

      detalleElement
        .ele('actividadEconomica')
        .txt(d.actividadEconomica.toString())
        .up();
      detalleElement
        .ele('codigoProductoSin')
        .txt(d.codigoProductoSin.toString())
        .up();
      detalleElement.ele('codigoProducto').txt(d.codigoProducto).up();
      detalleElement.ele('descripcion').txt(d.descripcion).up();
      detalleElement.ele('cantidad').txt(d.cantidad.toString()).up();
      detalleElement.ele('unidadMedida').txt(d.unidadMedida.toString()).up();
      detalleElement
        .ele('precioUnitario')
        .txt(d.precioUnitario.toFixed(2))
        .up();

      // montoDescuento (opcional)
      if (d.montoDescuento !== undefined && d.montoDescuento !== null) {
        detalleElement
          .ele('montoDescuento')
          .txt(d.montoDescuento.toString())
          .up();
      } else {
        detalleElement.ele('montoDescuento', { 'xsi:nil': 'true' }).up();
      }

      detalleElement
        .ele('subTotal')
        .txt((d.cantidad * d.precioUnitario).toFixed(2))
        .up();

      // numeroSerie (opcional)
      if (d.numeroSerie !== undefined && d.numeroSerie !== null) {
        detalleElement.ele('numeroSerie').txt(d.numeroSerie.toString()).up();
      } else {
        detalleElement.ele('numeroSerie', { 'xsi:nil': 'true' }).up();
      }

      // numeroImei (opcional)
      if (d.numeroImei !== undefined && d.numeroImei !== null) {
        detalleElement.ele('numeroImei').txt(d.numeroImei.toString()).up();
      } else {
        detalleElement.ele('numeroImei', { 'xsi:nil': 'true' }).up();
      }
    });

    return root.end({ prettyPrint: true });
  }
}
/* {
  "razonSocialEmisor": "EMPRESA DEMO S.R.L.",
  "municipio": "La Paz",
  "telefono": "77777777",
  "tipoDocumentoSector": 1,
  "tipoEmision": 1,
  "tipoFactura": 1,
  "tipoFacturaDocumento": 1,
  "nombreRazonSocial": "Juan Pérez",
  "codigoTipoDocumentoIdentidad": 1,
  "numeroDocumento": "12345678",
  "complemento": "LP",
  "codigoCliente": "CLI-001",
  "codigoMetodoPago": 1,
  "codigoMoneda": 1,
  "tipoCambio": 1,
  "montoGiftCard": 10,
  "descuentoAdicional": 5,
  "usuario": "admin",
  "codigoDocumentoSector": 1,
  "detalles": [
    {
      "actividadEconomica": "477110",
      "codigoProductoSin": 62233,
      "codigoProducto": "PROD-001",
      "descripcion": "polera",
      "cantidad": 10,
      "unidadMedida": 62,
      "precioUnitario": 2.5,
      "montoDescuento": 0
    }
  ]
} */
