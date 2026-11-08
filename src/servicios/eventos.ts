import { eventos } from "@/mocks/eventos";
import type { Evento, RespuestaLista } from "@/tipos";
import { ErrorDeApi, fuente, paginar, simularRed } from "./cliente";

export interface FiltrosEventos {
  /** Día en formato "2026-11-14". Si no se indica, trae todos. */
  dia?: string;
  pagina?: number;
  porPagina?: number;
}

export async function listarEventos(
  filtros: FiltrosEventos = {},
): Promise<RespuestaLista<Evento>> {
  await simularRed();
  let resultado = fuente(eventos);

  if (filtros.dia) {
    // El texto ISO ya trae la fecha local de Colón en sus primeros 10 caracteres.
    resultado = resultado.filter((evento) => evento.inicio.slice(0, 10) === filtros.dia);
  }
  resultado = [...resultado].sort((a, b) => a.inicio.localeCompare(b.inicio));
  return paginar(resultado, filtros.pagina, filtros.porPagina);
}

export async function obtenerEvento(id: string): Promise<Evento> {
  await simularRed();
  const evento = fuente(eventos).find((e) => e.id === id);
  if (!evento) throw new ErrorDeApi("EVENTO_NO_ENCONTRADO", "No existe ese evento.");
  return evento;
}