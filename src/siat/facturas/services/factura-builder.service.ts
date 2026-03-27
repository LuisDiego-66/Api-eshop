import { Injectable } from '@nestjs/common';
import { FacturaInterface } from '../interfaces/factura.interface';

import { create } from 'xmlbuilder2';
import { formatDateISO } from '../../helpers/date.util';

@Injectable()
export class FacturaBuilderService {
  buildFactura(data: FacturaInterface): string {
    const xml = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('facturaComputarizadaCompraVenta', {
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:noNamespaceSchemaLocation': 'facturaComputarizadaCompraVenta.xsd',
      })
      .ele('cabecera')

      //* Información del Emisor

      .ele('nitEmisor')
      .txt(data.nitEmisor.toString())
      .up()
      .ele('razonSocialEmisor')
      .txt(data.razonSocialEmisor)
      .up()
      .ele('municipio')
      .txt(data.municipio)
      .up()
      .ele('telefono')
      .txt(data.telefono)
      .up()

      //* Información de la Factura

      .ele('numeroFactura')
      .txt(data.numeroFactura.toString())
      .up()
      .ele('cuf')
      .txt(data.cuf)
      .up()
      .ele('cufd')
      .txt(data.cufd)
      .up()
      .ele('codigoSucursal')
      .txt(data.codigoSucursal.toString())
      .up()
      .ele('direccion')
      .txt(data.direccion)
      .up()
      .ele('codigoPuntoVenta')
      .txt(data.codigoPuntoVenta.toString())
      .up()
      .ele('fechaEmision')
      .txt(formatDateISO(data.fechaEmision))
      .up()

      //* Información del Cliente

      .ele('nombreRazonSocial')
      .txt(data.nombreRazonSocial)
      .up()
      .ele('codigoTipoDocumentoIdentidad')
      .txt(data.codigoTipoDocumentoIdentidad.toString())
      .up()
      .ele('numeroDocumento')
      .txt(data.numeroDocumento)
      .up()
      .ele('complemento')
      .att('xsi:nil', data.complemento ? 'false' : 'true') //! nullable
      .txt(data.complemento || '')
      .up()
      .ele('codigoCliente')
      .txt(data.codigoCliente)
      .up()
      .ele('codigoMetodoPago')
      .txt(data.codigoMetodoPago.toString())
      .up()
      .ele('numeroTarjeta')
      .att('xsi:nil', data.numeroTarjeta ? 'false' : 'true') //! nullable
      .txt(data.numeroTarjeta?.toString() || '')
      .up()

      //* Montos

      .ele('montoTotal')
      .txt(data.montoTotal.toFixed(2))
      .up()
      .ele('montoTotalSujetoIva')
      .txt(data.montoTotal.toFixed(2))
      .up()

      //* Moneda

      .ele('codigoMoneda')
      .txt(data.codigoMoneda.toString())
      .up()
      .ele('tipoCambio')
      .txt(data.tipoCambio.toString())
      .up()
      .ele('montoTotalMoneda')
      .txt(data.montoTotal.toFixed(2))
      .up()

      //* Descuetnos
      .ele('montoGiftCard')
      .att('xsi:nil', data.montoGiftCard ? 'false' : 'true') //! nullable
      .txt(data.montoGiftCard?.toString() || '')
      .up()
      .ele('descuentoAdicional')
      .att('xsi:nil', data.descuentoAdicional ? 'false' : 'true') //! nullable
      .txt(data.descuentoAdicional?.toString() || '')
      .up()
      .ele('codigoExcepcion')
      .att('xsi:nil', data.codigoExcepcion ? 'false' : 'true') //! nullable
      .txt(data.codigoExcepcion?.toString() || '')
      .up()
      .ele('cafc') //! Código de Autorización de Facturación por Contingencia
      .att('xsi:nil', data.cafc ? 'false' : 'true') //! nullable
      .txt(data.cafc?.toString() || '')
      .up()

      .ele('leyenda')
      .txt(data.leyenda)
      .up()
      .ele('usuario')
      .txt(data.usuario)
      .up()
      .ele('codigoDocumentoSector')
      .txt(data.codigoDocumentoSector.toString())
      .up()
      .up();

    //* Agregar detalles
    data.detalles.forEach((d) => {
      xml
        .ele('detalle')
        .ele('actividadEconomica')
        .txt(d.actividadEconomica.toString())
        .up()
        .ele('codigoProductoSin')
        .txt(d.codigoProductoSin.toString())
        .up()
        .ele('codigoProducto')
        .txt(d.codigoProducto)
        .up()
        .ele('descripcion')
        .txt(d.descripcion)
        .up()
        .ele('cantidad')
        .txt(d.cantidad.toString())
        .up()
        .ele('unidadMedida')
        .txt(d.unidadMedida.toString())
        .up()
        .ele('precioUnitario')
        .txt(d.precioUnitario.toFixed(2))
        .up()
        .ele('montoDescuento')
        .att('xsi:nil', d.montoDescuento ? 'false' : 'true') //! nullable
        .txt(data.montoGiftCard?.toString() || '')
        .up()
        .ele('subTotal')
        .txt((d.cantidad * d.precioUnitario).toFixed(2))
        .up()
        .ele('numeroSerie')
        .att('xsi:nil', d.numeroSerie ? 'false' : 'true') //! nullable
        .txt(data.montoGiftCard?.toString() || '')
        .up()
        .ele('numeroImei')
        .att('xsi:nil', d.numeroImei ? 'false' : 'true') //! nullable
        .txt(data.montoGiftCard?.toString() || '')
        .up();
    });

    return xml.end({ prettyPrint: true });
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

  "montoTotal": 25,
  "montoTotalSujetoIva": 25,
  "codigoMoneda": 1,
  "tipoCambio": 1,
  "montoTotalMoneda": 25,
  
  "leyenda": "Ley N° 453: Está prohibido importar, distribuir o comercializar productos expirados o prontos a expirar.",
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
      "subTotal": 25
    }
  ]
} */
