import type { Horario } from '@/tipos';

/** Los tramos de un día, ordenados de la mañana a la noche. Un día sin tramos es un día cerrado. */
export function tramosDelDia(horarios: Horario[], dia: number): Horario[] {
  return horarios.filter((h) => h.dia === dia).sort((a, b) => a.abre.localeCompare(b.abre));
}

/** Ejemplos: «Hoy 09:00 a 19:00», «Hoy 09:00 a 12:00 y 15:00 a 19:00», «Hoy cerrado». */
export function horarioDeHoy(horarios: Horario[], ahora = new Date()): string {
  if (horarios.length === 0) return 'Horario no informado';
  const tramos = tramosDelDia(horarios, ahora.getDay());
  if (tramos.length === 0) return 'Hoy cerrado';
  return `Hoy ${tramos.map((tramo) => `${tramo.abre} a ${tramo.cierra}`).join(' y ')}`;
}