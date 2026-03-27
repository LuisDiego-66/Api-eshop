export interface ResponseActividades {
  RespuestaListaActividades: RespuestaListaActividades;
}

export interface RespuestaListaActividades {
  transaccion: boolean;
  listaActividades: ListaActividades[];
}

export interface ListaActividades {
  codigoCaeb: string;
  descripcion: string;
  tipoActividad: string;
}
