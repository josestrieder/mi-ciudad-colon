import type { Horario } from '@/tipos';

export function horarioDeHoy(horarios: Horario[], ahora = new Date()): string {
  if (horarios.length === 0) return 'Horario no informado';
  const hoy = horarios.find((h) => h.dia === ahora.getDay());
  if (!hoy) return 'Hoy cerrado';
  return `Hoy ${hoy.abre} a ${hoy.cierra}`;
}