export interface ResponsePuntoVenta {
  success: boolean;
  data: Data;
  timestamp: string;
}

export interface Data {
  RespuestaRegistroPuntoVenta: RespuestaRegistroPuntoVenta;
}

export interface RespuestaRegistroPuntoVenta {
  codigoPuntoVenta: number;
  transaccion: boolean;
}
