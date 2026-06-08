export const SIAT_CONFIG = {
  nit: 7524709018,
  codigoSistema: '213F4BFDFFA4BC66515BE',
  ambiente: 2,
  modalidad: 2,

  TOKEN_SIAT:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJwYWRpbGxhY2FzaDE3QGdtYWlsLmNvbSIsImNvZGlnb1Npc3RlbWEiOiIyMTNGNEJGREZGQTRCQzY2NTE1QkUiLCJuaXQiOiJINHNJQUFBQUFBQUFBRE0zTlRJeE43QTBNTFFBQU9fRGpta0tBQUFBIiwiaWQiOjUxOTg5MzMsImV4cCI6MTc4Mjg0MDI4MywiaWF0IjoxNzgwMzQ5MDUzLCJuaXREZWxlZ2FkbyI6NzUyNDcwOTAxOCwic3Vic2lzdGVtYSI6IlNGRSJ9.1OQMluMzfkxjNiDwMVlViu_GjWJsbpIi30-yNutFtxFB9p_x3pCH7XpvZNsPGbgbf1aMhsWMYW7ak50C0qwXcg',

  wsdl: {
    codigos:
      'https://pilotosiatservicios.impuestos.gob.bo/v2/FacturacionCodigos?wsdl',

    sincronizacion:
      'https://pilotosiatservicios.impuestos.gob.bo/v2/FacturacionSincronizacion?wsdl',

    facturaCompraVenta:
      'https://pilotosiatservicios.impuestos.gob.bo/v2/ServicioFacturacionCompraVenta?wsdl',

    operaciones:
      'https://pilotosiatservicios.impuestos.gob.bo/v2/FacturacionOperaciones?wsdl',
  },
};
