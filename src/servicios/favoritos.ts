import { favoritos } from "@/mocks/usuarios";
import type { Favorito, RespuestaLista } from "@/tipos";
import { api, usarApiReal } from "./api";
import { fuente, paginar, simularRed } from "./cliente";

export async function listarFavoritos(usuarioId: string): Promise<RespuestaLista<Favorito>> {
  if (usarApiReal) {
    // En las listas de la API, el máximo por página es 100.
    const { data } = await api.get<RespuestaLista<Favorito>>("/yo/favoritos", {
      params: { porPagina: 100 },
    });
    return data;
  }

  await simularRed();
  const propios = fuente(favoritos).filter((f) => f.usuarioId === usuarioId);
  return paginar(propios, 1, propios.length || 1);
}

export async function agregarFavorito(usuarioId: string, lugarId: string): Promise<Favorito> {
  if (usarApiReal) {
    const { data } = await api.put<{ datos: Favorito }>(`/yo/favoritos/${encodeURIComponent(lugarId)}`);
    return data.datos;
  }

  await simularRed();
  const existente = favoritos.find((f) => f.usuarioId === usuarioId && f.lugarId === lugarId);
  if (existente) return existente;
  const nuevo: Favorito = {
    id: `fav-${Date.now()}`,
    usuarioId,
    lugarId,
    creadoEn: new Date().toISOString(),
  };
  favoritos.push(nuevo);
  return nuevo;
}

export async function quitarFavorito(usuarioId: string, lugarId: string): Promise<void> {
  if (usarApiReal) {
    await api.delete(`/yo/favoritos/${encodeURIComponent(lugarId)}`);
    return;
  }

  await simularRed();
  const indice = favoritos.findIndex((f) => f.usuarioId === usuarioId && f.lugarId === lugarId);
  if (indice !== -1) favoritos.splice(indice, 1);
}