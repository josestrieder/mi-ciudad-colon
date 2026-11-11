import { visitas } from "@/mocks/usuarios";
import type { OrigenVisita, RespuestaLista, Visita } from "@/tipos";
import { ahoraEnColon } from "@/utils/fechas";
import { fuente, paginar, simularRed } from "./cliente";

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
): Promise<Visita> {
  await simularRed();
  const nueva: Visita = {
    id: `vis-${Date.now()}`,
    usuarioId,
    lugarId,
    fechaHora: ahoraEnColon(),
    origen,
    fotoUri: null,
    nota: null,
    sincronizada: true, // el servidor la aceptó
  };
  visitas.push(nueva);
  return nueva;
}