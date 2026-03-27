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
  return base16 + params.codigoControlCUFD;
}
