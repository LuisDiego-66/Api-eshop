export interface ResponseRecepcionFactura {
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
  codigoRecepcion?: string;
  transaccion: boolean;
}

export interface MensajesList {
  codigo: number;
  descripcion: string;
}
