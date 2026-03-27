export interface FacturaInterface {
  //* Información del Emisor
  nitEmisor: number;
  razonSocialEmisor: string;
  municipio: string;
  telefono: string;

  //* Información de la Factura
  numeroFactura: number;
  cuf: string;
  cufd: string;
  codigoSucursal: number;
  direccion: string;
  codigoPuntoVenta: number;
  fechaEmision: Date;

  //* Información del Cliente
  nombreRazonSocial: string;
  codigoTipoDocumentoIdentidad: number;
  numeroDocumento: string;
  complemento?: string | null;
  codigoCliente: string;
  codigoMetodoPago: number;
  numeroTarjeta?: number | null;

  //* Montos
  montoTotal: number;
  montoTotalSujetoIva: number;

  //* Moneda
  codigoMoneda: number;
  tipoCambio: number;
  montoTotalMoneda: number;

  //* Descuentos
  montoGiftCard?: number | null;
  descuentoAdicional?: number | null;
  codigoExcepcion?: number | null;
  cafc?: number | null;

  leyenda: string;
  usuario: string;
  codigoDocumentoSector: number;
  detalles: FacturaDetalle[];
}

export interface FacturaDetalle {
  //* Catalogos
  actividadEconomica: string;
  codigoProductoSin: number;

  //* Sistema
  codigoProducto: string;
  descripcion: string;

  cantidad: number;
  unidadMedida: number;
  precioUnitario: number;
  montoDescuento?: number | null;

  subTotal: number;

  numeroSerie?: string | null;
  numeroImei?: string | null;
}
