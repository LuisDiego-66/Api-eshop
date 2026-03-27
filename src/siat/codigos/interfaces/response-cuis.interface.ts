export interface CUISResponse {
  success: boolean;
  data: Data;
  timestamp: string;
}

export interface Data {
  RespuestaCuis: RespuestaCuis;
}

export interface RespuestaCuis {
  codigo: string;
  fechaVigencia: string;
  mensajesList?: MensajesList[];
  transaccion: boolean;
}

export interface MensajesList {
  codigo: number;
  descripcion: string;
}
