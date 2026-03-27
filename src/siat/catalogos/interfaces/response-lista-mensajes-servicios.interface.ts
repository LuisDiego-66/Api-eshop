export interface ResponseListaMensajesServicios {
  RespuestaListaParametricas: RespuestaListaParametricas;
}

export interface RespuestaListaParametricas {
  transaccion: boolean;
  listaCodigos: ListaCodigo[];
}

export interface ListaCodigo {
  codigoClasificador: number;
  descripcion: string;
}
