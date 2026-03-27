export interface ResponseCierrePuntoVenta {
  success: boolean;
  data: Data;
  timestamp: string;
}

export interface Data {
  RespuestaCierrePuntoVenta: RespuestaCierrePuntoVenta;
}

export interface RespuestaCierrePuntoVenta {
  codigoPuntoVenta: number;
  transaccion: boolean;
}
