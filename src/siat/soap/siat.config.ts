import { envs } from 'src/config/environments/environments';

export const SIAT_CONFIG = {
  nit: Number(envs.SIAT_NIT),
  codigoSistema: envs.SIAT_CODIGO_SISTEMA,
  ambiente: Number(envs.SIAT_AMBIENTE),
  modalidad: Number(envs.SIAT_MODALIDAD),

  TOKEN_SIAT: envs.SIAT_TOKEN,

  wsdl: {
    codigos: envs.SIAT_WSDL_CODIGOS,
    sincronizacion: envs.SIAT_WSDL_SINCRONIZACION,
    facturaCompraVenta: envs.SIAT_WSDL_FACTURA_COMPRA_VENTA,
    operaciones: envs.SIAT_WSDL_OPERACIONES,
  },
};
