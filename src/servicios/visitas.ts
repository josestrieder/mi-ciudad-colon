import { visitas } from "@/mocks/usuarios";
import type { OrigenVisita, RespuestaLista, Visita } from "@/tipos";
import { ahoraEnColon, claveDia } from "@/utils/fechas";
import { ErrorDeApi, fuente, paginar, simularRed } from "./cliente";

export async function listarVisitas(usuarioId: string): Promise<RespuestaLista<Visita>> {
  await simularRed();
  const propias = fuente(visitas)
    .filter((v) => v.usuarioId === usuarioId)
    .sort((a, b) => b.fechaHora.localeCompare(a.fechaHora)); // la más nueva primero
  return paginar(propias, 1, propias.length || 1);
}

export async function registrarVisita(
  usuarioId: string,
  lugarId: string,
  origen: OrigenVisita,
  fechaHora: string = ahoraEnColon(),
): Promise<Visita> {
  await simularRed();

  // Una visita por lugar y por día.
  const dia = claveDia(fechaHora);
  const yaRegistrada = visitas.some(
    (v) => v.usuarioId === usuarioId && v.lugarId === lugarId && claveDia(v.fechaHora) === dia,
  );
  if (yaRegistrada) {
    throw new ErrorDeApi("VISITA_DUPLICADA", "Ya registraste este lugar hoy.");
  }

  const nueva: Visita = {
    id: `vis-${Date.now()}`,
    usuarioId,
    lugarId,
    fechaHora,
    origen,
    fotoUri: null,
    nota: null,
    sincronizada: true, // el servidor la aceptó
  };
  visitas.push(nueva);
  return nueva;
}


export interface CambiosVisita {
  fotoUri?: string | null;
  nota?: string | null;
}

export async function actualizarVisita(
  usuarioId: string,
  visitaId: string,
  cambios: CambiosVisita,
): Promise<Visita> {
  await simularRed();
  const indice = visitas.findIndex((v) => v.id === visitaId && v.usuarioId === usuarioId);
  if (indice === -1) throw new ErrorDeApi("VISITA_NO_ENCONTRADA", "No existe esa visita.");
  const actualizada: Visita = { ...visitas[indice], ...cambios };
  visitas[indice] = actualizada; // se reemplaza el objeto, no se modifica el que ya tenía la caché
  return actualizada;
}

export async function eliminarVisita(usuarioId: string, visitaId: string): Promise<void> {
  await simularRed();
  const indice = visitas.findIndex((v) => v.id === visitaId && v.usuarioId === usuarioId);
  if (indice === -1) throw new ErrorDeApi("VISITA_NO_ENCONTRADA", "No existe esa visita.");
  visitas.splice(indice, 1);
}