import { favoritos } from "@/mocks/usuarios";
import type { Favorito, RespuestaLista } from "@/tipos";
import { fuente, paginar, simularRed } from "./cliente";

export async function listarFavoritos(usuarioId: string): Promise<RespuestaLista<Favorito>> {
  await simularRed();
  const propios = fuente(favoritos).filter((f) => f.usuarioId === usuarioId);
  return paginar(propios, 1, propios.length || 1);
}

export async function agregarFavorito(usuarioId: string, lugarId: string): Promise<Favorito> {
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
  await simularRed();
  const indice = favoritos.findIndex((f) => f.usuarioId === usuarioId && f.lugarId === lugarId);
  if (indice !== -1) favoritos.splice(indice, 1);
}