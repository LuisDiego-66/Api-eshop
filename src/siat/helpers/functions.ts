//? ============================================================================================== */
//?                               Completar_Ceros                                                  */
//? ============================================================================================== */

export function completarCeros(
  pString: string,
  pMaxChar: number,
  pRigth: boolean = false,
): string {
  let vNewString = pString;

  if (pString.length < pMaxChar) {
    for (let i = pString.length; i < pMaxChar; i++) {
      if (pRigth) {
        vNewString = vNewString.concat('0');
      } else {
        vNewString = '0'.concat(vNewString);
      }
    }
  }
  return vNewString;
}

//? ============================================================================================== */
//?                                     Modulo 11                                                  */
//? ============================================================================================== */

export function modulo11(cadena: string): number {
  let suma = 0;
  let multiplicador = 2;

  for (let i = cadena.length - 1; i >= 0; i--) {
    suma += parseInt(cadena[i], 10) * multiplicador;
    multiplicador = multiplicador === 9 ? 2 : multiplicador + 1;
  }

  const digito = suma % 11;
  return digito === 10 ? 1 : digito === 11 ? 0 : digito;
}

//? ============================================================================================== */
//?                                       Base 16                                                  */
//? ============================================================================================== */

export function toBase16(pString: string): string {
  try {
    if (!/^\d+$/.test(pString)) {
      throw new Error('La cadena debe contener solo dígitos numéricos');
    }

    const vValor = BigInt(pString);
    return vValor.toString(16).toUpperCase();
  } catch (error) {
    console.error(`Error en base16: ${error}`);
    throw error;
  }
}

//? ============================================================================================== */
//?                                       SHA_256                                                  */
//? ============================================================================================== */

export function algoritmoHash(
  pArchivo: number[] | Uint8Array,
  algorithm: string,
): string {
  let hashValue = '';

  try {
    const crypto = require('crypto');
    const messageDigest = crypto.createHash(algorithm);

    let buffer: Buffer;
    if (pArchivo instanceof Uint8Array) {
      buffer = Buffer.from(pArchivo);
    } else {
      buffer = Buffer.from(pArchivo);
    }

    messageDigest.update(buffer);
    const digestedBytes = messageDigest.digest();
    hashValue = digestedBytes.toString('hex').toLowerCase();
  } catch (e) {
    console.log('Error generando Hash');
  }

  return hashValue;
}
