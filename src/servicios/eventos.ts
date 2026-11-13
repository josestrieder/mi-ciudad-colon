import { eventos } from "@/mocks/eventos";
import type { Evento, RespuestaLista } from "@/tipos";
import { api, usarApiReal } from "./api";
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
  if (usarApiReal) {
    const { data } = await api.get<RespuestaLista<Evento>>("/eventos", {
      // Sin filtro de día, la API trae los eventos desde hoy. En las listas de eventos, el máximo es 100.
      params: { fecha: filtros.dia, pagina: filtros.pagina, porPagina: filtros.porPagina ?? 100 },
    });
    return data;
  }

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
  if (usarApiReal) {
    const { data } = await api.get<{ datos: Evento }>(`/eventos/${encodeURIComponent(id)}`);
    return data.datos;
  }

  await simularRed();
  const evento = fuente(eventos).find((e) => e.id === id);
  if (!evento) throw new ErrorDeApi("EVENTO_NO_ENCONTRADO", "No existe ese evento.");
  return evento;
}