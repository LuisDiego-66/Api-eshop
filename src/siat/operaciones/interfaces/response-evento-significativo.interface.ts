export interface ResponseEventoSiginificativo {
  success: boolean;
  data: Data;
  timestamp: string;
}

export interface Data {
  RespuestaListaEventos: RespuestaListaEventos;
}

export interface RespuestaListaEventos {
  codigoRecepcionEventoSignificativo?: number;
  mensajesList?: MensajesList[];
  transaccion: boolean;
}

export interface MensajesList {
  codigo: number;
  descripcion: string;
}

/* export interface ResponseEventoSiginificativo {
  success: boolean;
  data: Data | RespuestaListaEventos;
  timestamp: string;
}

export interface Data {
  RespuestaListaEventos?: RespuestaListaEventos;
}

export interface RespuestaListaEventos {
  codigoRecepcionEventoSignificativo?: number;
  mensajesList?: MensajesList[];
  transaccion: boolean;
}

export interface MensajesList {
  codigo: number;
  descripcion: string;
} */
