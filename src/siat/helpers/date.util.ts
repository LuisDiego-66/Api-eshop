export function formatDateForCUF(date: Date): string {
  const pad = (n: number, z = 2) => String(n).padStart(z, '0');

  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds()) +
    pad(date.getMilliseconds(), 3)
  );
}

/* export function formatDateForCUF(date: Date): string {
  const boliviaDate = new Date(
    date.toLocaleString('en-US', { timeZone: 'America/La_Paz' }),
  );

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');

  return (
    boliviaDate.getFullYear().toString() +
    pad(boliviaDate.getMonth() + 1) +
    pad(boliviaDate.getDate()) +
    pad(boliviaDate.getHours()) +
    pad(boliviaDate.getMinutes()) +
    pad(boliviaDate.getSeconds()) +
    pad(boliviaDate.getMilliseconds(), 3)
  );
}
 */
/* export function formatDateForCUF(date: Date): string {
  const boliviaDate = new Date(
    date.toLocaleString('en-US', { timeZone: 'America/La_Paz' }),
  );

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');

  return (
    boliviaDate.getFullYear().toString() +
    pad(boliviaDate.getMonth() + 1) +
    pad(boliviaDate.getDate()) +
    pad(boliviaDate.getHours()) +
    pad(boliviaDate.getMinutes()) +
    pad(boliviaDate.getSeconds()) +
    String(boliviaDate.getMilliseconds()).padStart(3, '0')
  );
} */

export function formatDateISO(date: Date): string {
  return date.toISOString();
}

//! Bolivia (America/La_Paz) es UTC-4 fijo, sin horario de verano: alcanza con
//! anexar el offset para obtener el instante absoluto correcto a partir de un
//! string naive (sin offset) que representa hora Bolivia. Se usa tanto para
//! comparar contra otras fechas absolutas (columnas timestamptz) como para
//! construir el valor que se persiste en factura.fechaEmision (timestamptz).
//! NO usar para CUF: el CUF sigue formateando el string naive original
//! directamente (formatDateForCUF(new Date(fechaHora))), sin pasar por acá.
export function parseBoliviaDateTime(naiveIso: string): Date {
  return new Date(`${naiveIso}-04:00`);
}
