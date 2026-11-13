import { categorias } from "@/mocks/categorias";
import { lugares } from "@/mocks/lugares";
import type { Categoria, Coordenadas, Lugar, RespuestaLista } from "@/tipos";
import { distanciaMetros } from "@/utils/distancia";
import { api, usarApiReal } from "./api";
import { ErrorDeApi, fuente, normalizar, paginar, simularRed } from "./cliente";

// Con la API real, estas funciones piden los datos con Axios; sin ella, usan src/mocks.
// Las pantallas no se enteran: los nombres y lo que devuelven no cambian.

export interface FiltrosLugares {
  categoriaId?: string;
  busqueda?: string;
  incluirInactivos?: boolean;
  pagina?: number;
  porPagina?: number;
}

export type LugarCercano = Lugar & { distanciaMetros: number };

// La API deja pedir hasta 500 lugares por página: el teléfono guarda el catálogo entero.
const TODOS = 500;

export async function listarLugares(
  filtros: FiltrosLugares = {},
): Promise<RespuestaLista<Lugar>> {
  if (usarApiReal) {
    const { data } = await api.get<RespuestaLista<Lugar>>("/lugares", {
      params: {
        categoriaId: filtros.categoriaId,
        q: filtros.busqueda?.trim() || undefined,
        pagina: filtros.pagina,
        porPagina: filtros.porPagina ?? TODOS,
        // Con esta fecha, la API devuelve también los lugares dados de baja.
        actualizadoDesde: filtros.incluirInactivos ? "2000-01-01T00:00:00-03:00" : undefined,
      },
    });
    return data;
  }

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
  if (usarApiReal) {
    const { data } = await api.get<{ datos: Lugar }>(`/lugares/${encodeURIComponent(id)}`);
    return data.datos;
  }

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
  if (usarApiReal) {
    const { data } = await api.get<RespuestaLista<Lugar>>("/lugares", {
      params: {
        latitud: posicion.latitud,
        longitud: posicion.longitud,
        orden: "distancia",
        radioMetros,
        porPagina: TODOS,
      },
    });
    // La API ordena y filtra, pero no devuelve la distancia: se calcula en el teléfono.
    return data.datos.map((lugar) => ({
      ...lugar,
      distanciaMetros: distanciaMetros(posicion, lugar.coordenadas),
    }));
  }

  await simularRed();
  return fuente(lugares)
    .filter((lugar) => lugar.activo)
    .map((lugar) => ({ ...lugar, distanciaMetros: distanciaMetros(posicion, lugar.coordenadas) }))
    .filter((lugar) => radioMetros === undefined || lugar.distanciaMetros <= radioMetros)
    .sort((a, b) => a.distanciaMetros - b.distanciaMetros);
}

export async function listarCategorias(): Promise<RespuestaLista<Categoria>> {
  if (usarApiReal) {
    const { data } = await api.get<RespuestaLista<Categoria>>("/categorias", {
      params: { porPagina: 100 },
    });
    return data;
  }

  await simularRed();
  const ordenadas = [...fuente(categorias)].sort((a, b) => a.orden - b.orden);
  return paginar(ordenadas, 1, ordenadas.length || 1);
}