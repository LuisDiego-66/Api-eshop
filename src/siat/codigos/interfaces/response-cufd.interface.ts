export interface CUFDResponse {
  RespuestaCufd: RespuestaCufd;
}

export interface RespuestaCufd {
  codigo: string;
  codigoControl: string;
  direccion: string;
  fechaVigencia: string;
  transaccion: boolean;
}
