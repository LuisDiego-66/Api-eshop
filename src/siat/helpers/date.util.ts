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
//! string naive (sin offset) que representa hora Bolivia. Usar SOLO para
//! comparar contra otras fechas absolutas (columnas timestamptz); no usar
//! para CUF ni para columnas timestamp sin tz, que esperan el string naive
//! intacto (se leen con getters locales, no con el instante absoluto).
export function parseBoliviaDateTime(naiveIso: string): Date {
  return new Date(`${naiveIso}-04:00`);
}
