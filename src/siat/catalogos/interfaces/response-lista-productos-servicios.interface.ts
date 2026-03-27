export interface ResponseListaProductosServicios {
  RespuestaListaProductos: RespuestaListaProductos;
}

export interface RespuestaListaProductos {
  transaccion: boolean;
  listaCodigos: ListaCodigo[];
}

export interface ListaCodigo {
  codigoActividad: string;
  codigoProducto: number;
  descripcionProducto: string;
  nandina?: string[];
}
