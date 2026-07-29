export type ResponseRecepcionPaqueteFactura =
  | { success: true; data: Data; timestamp: string }
  | { success: false; error: string; timestamp: string };

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
