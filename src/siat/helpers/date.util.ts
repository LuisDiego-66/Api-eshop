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

export function formatDateISO(date: Date): string {
  return date.toISOString();
}
