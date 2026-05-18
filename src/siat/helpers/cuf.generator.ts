import { completarCeros, modulo11, toBase16 } from './functions';

interface GenerarCUFParams {
  nit: number;
  fechaHora: string; // YYYYMMDDHHMMSSmmm
  codigoSucursal: number;
  modalidad: number;
  tipoEmision: number;
  tipoFactura: number;
  tipoDocumentoSector: number;
  numeroFactura: number;
  codigoPuntoVenta: number;
  codigoControlCUFD: string;
}

export function generarCUF(params: GenerarCUFParams): string {
  // Completar campos

  //console.log(params);

  const nit = completarCeros(params.nit.toString(), 13);
  const sucursal = completarCeros(params.codigoSucursal.toString(), 4);

  const tipoDocumentoSector = completarCeros(
    params.tipoDocumentoSector.toString(),
    2,
  );
  const numeroFactura = completarCeros(params.numeroFactura.toString(), 10);
  const puntoVenta = completarCeros(params.codigoPuntoVenta.toString(), 4);

  // Concatenar cadena base (53 dígitos)
  const cadenaBase =
    nit +
    params.fechaHora +
    sucursal +
    params.modalidad +
    params.tipoEmision +
    params.tipoFactura +
    tipoDocumentoSector +
    numeroFactura +
    puntoVenta;

  // Dígito verificador Módulo 11
  const digitoVerificador = modulo11(cadenaBase);

  // Cadena con dígito (54)
  const cadenaConDigito = cadenaBase + digitoVerificador;

  // Convertir a Base 16
  const base16 = toBase16(cadenaConDigito);

  // Concatenar código de control CUFD

  //console.log(base16 + params.codigoControlCUFD);
  return base16 + params.codigoControlCUFD;
}

// helpers/cuf.generator.ts

/* import { completarCeros, modulo11, toBase16 } from './functions';

interface GenerarCUFParams {
  nit: number;
  fechaHora: string; // YYYYMMDDHHMMSSmmm
  modalidad: number;
  codigoSucursal: number;
  codigoPuntoVenta: number;
  tipoEmision: number;
  tipoFactura: number;
  tipoDocumentoSector: number;
  numeroFactura: number;
  codigoControlCUFD: string;
}

export function generarCUF(params: GenerarCUFParams): string {
  // 1. Formatear campos con ceros a la izquierda
  const nit = completarCeros(params.nit.toString(), 13);
  const sucursal = completarCeros(params.codigoSucursal.toString(), 4);
  const puntoVenta = completarCeros(params.codigoPuntoVenta.toString(), 4);
  const tipoDocumentoSector = completarCeros(
    params.tipoDocumentoSector.toString(),
    2,
  );
  const numeroFactura = completarCeros(params.numeroFactura.toString(), 10);
  const modalidad = completarCeros(params.modalidad.toString(), 2);
  const tipoEmision = completarCeros(params.tipoEmision.toString(), 2);
  const tipoFactura = completarCeros(params.tipoFactura.toString(), 2);

  // 2. Concatenar campos en el orden EXACTO que pide SIAT
  // IMPORTANTE: Verificar el orden oficial en la documentación de SIAT
  const cadenaBase =
    nit + // 13 dígitos
    params.fechaHora + // 17 dígitos (YYYYMMDDHHMMSSmmm)
    sucursal + // 4 dígitos
    modalidad + // 2 dígitos
    tipoEmision + // 2 dígitos
    tipoFactura + // 2 dígitos
    tipoDocumentoSector + // 2 dígitos
    numeroFactura + // 10 dígitos
    puntoVenta; // 4 dígitos

  // Total: 13 + 17 + 4 + 2 + 2 + 2 + 2 + 10 + 4 = 56 dígitos

  console.log('Cadena base para CUF:', cadenaBase);
  console.log('Longitud cadena base:', cadenaBase.length); // Debe ser 56

  // 3. Calcular dígito verificador módulo 11
  const digitoVerificador = modulo11(cadenaBase);

  // 4. Agregar dígito verificador a la cadena
  const cadenaConDigito = cadenaBase + digitoVerificador;

  // 5. Convertir toda la cadena a Base16 (Hexadecimal)
  const base16 = toBase16(cadenaConDigito);

  // 6. Concatenar código de control del CUFD
  const cufCompleto = base16 + params.codigoControlCUFD;

  return cufCompleto;
} */

// 8727F63A15F8976591FDDE5B387C5D015A29E06A1A19E23EF34124CD
// 8727F63A15F8976591FDDE5B387C5D015A29E06A1A19E23EF34124CD
