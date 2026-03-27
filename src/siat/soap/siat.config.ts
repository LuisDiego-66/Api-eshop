export const SIAT_CONFIG = {
  nit: 7524709018,
  codigoSistema: '213F4BFDFFA4BC66515BE',
  ambiente: 2,
  modalidad: 2,

  TOKEN_SIAT:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJwYWRpbGxhY2FzaDE3QGdtYWlsLmNvbSIsImNvZGlnb1Npc3RlbWEiOiIyMTNGNEJGREZGQTRCQzY2NTE1QkUiLCJuaXQiOiJINHNJQUFBQUFBQUFBRE0zTlRJeE43QTBNTFFBQU9fRGpta0tBQUFBIiwiaWQiOjUxOTg5MzMsImV4cCI6MTc4MDE4NDYzMSwiaWF0IjoxNzc0NDEwMjAxLCJuaXREZWxlZ2FkbyI6NzUyNDcwOTAxOCwic3Vic2lzdGVtYSI6IlNGRSJ9.-sdWwqNAOLvgEJk4k5HVwAc5Td1dVHFJrACGyzeii2bv35RH9GpKQ1u8ieXl1EupYrc6S87V65qtg2UpG155-g',
  //'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJwYWRpbGxhY2FzaDE3QGdtYWlsLmNvbSIsImNvZGlnb1Npc3RlbWEiOiIyMTNGNEJGREZGQTRCQzY2NTE1QkUiLCJuaXQiOiJINHNJQUFBQUFBQUFBRE0zTlRJeE43QTBNTFFBQU9fRGpta0tBQUFBIiwiaWQiOjUxOTg5MzMsImV4cCI6MTc3MjI5NzExNCwiaWF0IjoxNzY5MjAxMDg1LCJuaXREZWxlZ2FkbyI6NzUyNDcwOTAxOCwic3Vic2lzdGVtYSI6IlNGRSJ9.rxSbjsoYapjYbxZ_KG-moqoIovHWiwqWQlyguBuXKxYHJ7TPCdNlvYmh5SnvJdpSrIHaLsGTfFrrJ3whddTLqQ',

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
