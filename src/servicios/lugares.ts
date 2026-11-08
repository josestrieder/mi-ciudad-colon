import { categorias } from "@/mocks/categorias";
import { lugares } from "@/mocks/lugares";
import type { Categoria, Coordenadas, Lugar, RespuestaLista } from "@/tipos";
import { distanciaMetros } from "@/utils/distancia";
import { ErrorDeApi, fuente, normalizar, paginar, simularRed } from "./cliente";

// Este es el ÚNICO archivo que cambia cuando llegue la API de la cátedra:
// hoy lee de src/mocks, mañana hace fetch. Las pantallas no se enteran.

export interface FiltrosLugares {
  categoriaId?: string;
  busqueda?: string;
  incluirInactivos?: boolean;
  pagina?: number;
  porPagina?: number;
}

export type LugarCercano = Lugar & { distanciaMetros: number };

export async function listarLugares(
  filtros: FiltrosLugares = {},
): Promise<RespuestaLista<Lugar>> {
  await simularRed();
  let resultado = fuente(lugares);

  if (!filtros.incluirInactivos) {
    resultado = resultado.filter((lugar) => lugar.activo);
  }
  if (filtros.categoriaId) {
    resultado = resultado.filter((lugar) => lugar.categoriaId === filtros.categoriaId);
  }
  if (filtros.busqueda?.trim()) {
    const buscado = normalizar(filtros.busqueda);
    resultado = resultado.filter((lugar) => normalizar(lugar.nombre).includes(buscado));
  }
  return paginar(resultado, filtros.pagina, filtros.porPagina);
}

export async function obtenerLugar(id: string): Promise<Lugar> {
  await simularRed();
  const lugar = fuente(lugares).find((l) => l.id === id);
  if (!lugar) throw new ErrorDeApi("LUGAR_NO_ENCONTRADO", "No existe ese lugar.");
  return lugar;
}

/** "Lo que tenés cerca": lugares activos ordenados por distancia a la posición dada. */
export async function listarCercanos(
  posicion: Coordenadas,
  radioMetros?: number,
): Promise<LugarCercano[]> {
  await simularRed();
  return fuente(lugares)
    .filter((lugar) => lugar.activo)
    .map((lugar) => ({ ...lugar, distanciaMetros: distanciaMetros(posicion, lugar.coordenadas) }))
    .filter((lugar) => radioMetros === undefined || lugar.distanciaMetros <= radioMetros)
    .sort((a, b) => a.distanciaMetros - b.distanciaMetros);
}

export async function listarCategorias(): Promise<RespuestaLista<Categoria>> {
  await simularRed();
  const ordenadas = [...fuente(categorias)].sort((a, b) => a.orden - b.orden);
  return paginar(ordenadas, 1, ordenadas.length || 1);
}