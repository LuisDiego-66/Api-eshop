export interface ResponseListaActividadesDocumentoSector {
  RespuestaListaActividadesDocumentoSector: RespuestaListaActividadesDocumentoSector;
}

export interface RespuestaListaActividadesDocumentoSector {
  transaccion: boolean;
  listaActividadesDocumentoSector: ListaActividadesDocumentoSector[];
}

export interface ListaActividadesDocumentoSector {
  codigoActividad: string;
  codigoDocumentoSector: number;
  tipoDocumentoSector: string;
}
