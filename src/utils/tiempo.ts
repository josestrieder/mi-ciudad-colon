/** 252 → "4:12" */
export function formatearTiempo(segundos: number): string {
  const total = Math.max(0, Math.floor(segundos));
  const minutos = Math.floor(total / 60);
  const resto = total % 60;
  return `${minutos}:${resto.toString().padStart(2, '0')}`;
}