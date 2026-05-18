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

/* export function modulo11(cadena: string): number {
  let suma = 0;
  let multiplicador = 2;

  for (let i = cadena.length - 1; i >= 0; i--) {
    suma += parseInt(cadena[i], 10) * multiplicador;
    multiplicador = multiplicador === 9 ? 2 : multiplicador + 1;
  }

  const digito = suma % 11;
  return digito === 10 ? 1 : digito === 11 ? 0 : digito;
} */

export function modulo11(cadena: string): string {
  let suma = 0;
  let multiplicador = 2;

  for (let i = cadena.length - 1; i >= 0; i--) {
    suma += Number(cadena[i]) * multiplicador;
    multiplicador = multiplicador === 9 ? 2 : multiplicador + 1;
  }

  const digito = suma % 11;

  return digito === 10 ? '1' : String(digito);
}

/* export function calculaDigitoMod11(
  cadena: string,
  numDig: number = 1,
  limMult: number = 9,
  x10: boolean = true,
): string {
  let cadenaTrabajo = cadena;

  for (let n = 1; n <= numDig; n++) {
    let suma = 0;
    let mult = 2;

    // Recorrer de derecha a izquierda
    for (let i = cadenaTrabajo.length - 1; i >= 0; i--) {
      suma += mult * parseInt(cadenaTrabajo.substring(i, i + 1));
      mult++;
      if (mult > limMult) mult = 2;
    }

    let dig: number;
    if (x10) {
      // Fórmula especial para CUF (x10 = true)
      dig = ((suma * 10) % 11) % 10;
    } else {
      // Módulo simple
      dig = suma % 11;
    }

    // Agregar dígito a la cadena según las reglas
    if (dig === 10) {
      cadenaTrabajo += '1';
    } else if (dig === 11) {
      cadenaTrabajo += '0';
    } else if (dig < 10) {
      cadenaTrabajo += dig.toString();
    }
  }

  // Retornar los últimos numDig dígitos
  return cadenaTrabajo.substring(cadenaTrabajo.length - numDig);
} */

// Mantén la función original para compatibilidad, pero que use la correcta
/* export function modulo11(cadena: string): number {
  const digitoStr = calculaDigitoMod11(cadena, 1, 9, true);
  return parseInt(digitoStr, 10);
} */

/* export function modulo11(cadena: string): number {
  let suma = 0;
  let multiplicador = 2;

  for (let i = cadena.length - 1; i >= 0; i--) {
    suma += parseInt(cadena[i], 10) * multiplicador;
    multiplicador = multiplicador === 9 ? 2 : multiplicador + 1;
  }

  const digito = ((suma * 10) % 11) % 10;

  if (digito === 10) return 1;
  if (digito === 11) return 0;

  return digito;
}
 */
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
