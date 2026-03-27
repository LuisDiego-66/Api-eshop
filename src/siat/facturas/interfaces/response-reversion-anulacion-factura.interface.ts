export interface ResponseReversionAnulacionFactura {
  success: boolean;
  data: Data;
  timestamp: string;
}

export interface Data {
  RespuestaServicioFacturacion: RespuestaServicioFacturacion;
}

export interface RespuestaServicioFacturacion {
  codigoDescripcion: string;
  codigoEstado: number;
  mensajesList?: MensajesList[];
  transaccion: boolean;
}

export interface MensajesList {
  codigo: number;
  descripcion: string;
}
