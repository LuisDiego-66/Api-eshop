export interface ResponseListaLeyendasFactura {
  RespuestaListaParametricasLeyendas: RespuestaListaParametricasLeyendas;
}

export interface RespuestaListaParametricasLeyendas {
  transaccion: boolean;
  listaLeyendas: ListaLeyenda[];
}

export interface ListaLeyenda {
  codigoActividad: string;
  descripcionLeyenda: string;
}
