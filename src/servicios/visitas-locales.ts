import type { SQLiteDatabase } from 'expo-sqlite';
import Storage from 'expo-sqlite/kv-store';

import type { OrigenVisita, Visita } from '@/tipos';
import { ahoraEnColon, claveDia } from '@/utils/fechas';
import { ErrorDeApi } from './cliente';

export type VisitaPendiente = {
  id: string;
  usuarioId: string;
  lugarId: string;
  origen: OrigenVisita;
  fechaHora: string;
};

type Fila = {
  id: string;
  usuario_id: string;
  lugar_id: string;
  origen: OrigenVisita;
  fecha_hora: string;
};

function aPendiente(fila: Fila): VisitaPendiente {
  return {
    id: fila.id,
    usuarioId: fila.usuario_id,
    lugarId: fila.lugar_id,
    origen: fila.origen,
    fechaHora: fila.fecha_hora,
  };
}

/** Una visita pendiente se muestra como cualquier otra, marcada como no sincronizada. */
export function aVisita(pendiente: VisitaPendiente): Visita {
  return {
    id: pendiente.id,
    usuarioId: pendiente.usuarioId,
    lugarId: pendiente.lugarId,
    fechaHora: pendiente.fechaHora,
    origen: pendiente.origen,
    fotoUri: null,
    nota: null,
    sincronizada: false,
  };
}

export async function leerPendientes(db: SQLiteDatabase, usuarioId: string): Promise<VisitaPendiente[]> {
  const filas = await db.getAllAsync<Fila>(
    'SELECT * FROM visitas_pendientes WHERE usuario_id = ? ORDER BY fecha_hora',
    [usuarioId],
  );
  return filas.map(aPendiente);
}

/** Sin conexión: la visita se guarda en el teléfono, con la hora en que pasó. */
export async function guardarPendiente(
  db: SQLiteDatabase,
  usuarioId: string,
  lugarId: string,
  origen: OrigenVisita,
): Promise<Visita> {
  const hoy = claveDia(ahoraEnColon());
  const repetida = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM visitas_pendientes WHERE usuario_id = ? AND lugar_id = ? AND substr(fecha_hora, 1, 10) = ?',
    [usuarioId, lugarId, hoy],
  );
  if (repetida) throw new ErrorDeApi('VISITA_DUPLICADA', 'Ya registraste este lugar hoy.');

  const pendiente: VisitaPendiente = {
    id: `local-${Date.now()}`,
    usuarioId,
    lugarId,
    origen,
    fechaHora: ahoraEnColon(),
  };
  await db.runAsync(
    'INSERT INTO visitas_pendientes (id, usuario_id, lugar_id, origen, fecha_hora) VALUES (?, ?, ?, ?, ?)',
    [pendiente.id, pendiente.usuarioId, pendiente.lugarId, pendiente.origen, pendiente.fechaHora],
  );
  return aVisita(pendiente);
}

export async function borrarPendiente(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM visitas_pendientes WHERE id = ?', [id]);
}

// Copia de las visitas que dio el servidor la última vez: un solo objeto que se lee entero (kv-store).
const claveCopia = (usuarioId: string) => `visitas:${usuarioId}`;

export async function guardarCopiaVisitas(usuarioId: string, visitas: Visita[]): Promise<void> {
  await Storage.setItem(claveCopia(usuarioId), JSON.stringify(visitas));
}

export async function leerCopiaVisitas(usuarioId: string): Promise<Visita[] | null> {
  const texto = await Storage.getItem(claveCopia(usuarioId));
  return texto ? (JSON.parse(texto) as Visita[]) : null;
}
