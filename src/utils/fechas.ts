import type { Evento } from '@/tipos';

/** "2026-11-14T21:00:00-03:00" → "2026-11-14" */
export function claveDia(iso: string): string {
  return iso.slice(0, 10);
}

/** "2026-11-14T21:00:00-03:00" → "21:00" (la hora ya viene en horario de Colón) */
export function horaDe(iso: string): string {
  return iso.slice(11, 16);
}

/** "2026-11-14" → "Sábado, 14 de noviembre" */
export function tituloDia(clave: string): string {
  const fecha = new Date(`${clave}T12:00:00-03:00`); // mediodía, para evitar corrimientos de día
  const texto = fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export type SeccionDia = { title: string; data: Evento[] };

/** Agrupa eventos por día. Espera la lista ya ordenada por fecha (el servicio la ordena). */
export function agruparPorDia(eventos: Evento[]): SeccionDia[] {
  const secciones: SeccionDia[] = [];
  for (const evento of eventos) {
    const titulo = tituloDia(claveDia(evento.inicio));
    const ultima = secciones[secciones.length - 1];
    if (ultima && ultima.title === titulo) {
      ultima.data.push(evento);
    } else {
      secciones.push({ title: titulo, data: [evento] });
    }
  }
  return secciones;
}