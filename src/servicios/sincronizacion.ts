import type { SQLiteDatabase } from 'expo-sqlite';

import { ErrorDeApi } from './cliente';
import { registrarVisita } from './visitas';
import { borrarPendiente, leerPendientes } from './visitas-locales';

export type ResultadoSincronizacion = { subidas: number; pendientes: number };

let enCurso = false; // que no corran dos sincronizaciones a la vez

/** Sube las visitas pendientes, de a una, con la hora en que pasaron. */
export async function subirPendientes(
  db: SQLiteDatabase,
  usuarioId: string,
): Promise<ResultadoSincronizacion> {
  if (enCurso) return { subidas: 0, pendientes: 0 };
  enCurso = true;

  try {
    const pendientes = await leerPendientes(db, usuarioId);
    let subidas = 0;
    let quedan = 0;

    for (let i = 0; i < pendientes.length; i++) {
      const pendiente = pendientes[i];
      try {
        await registrarVisita(usuarioId, pendiente.lugarId, pendiente.origen, pendiente.fechaHora);
        await borrarPendiente(db, pendiente.id); // ya está en el servidor: se saca del teléfono
        subidas += 1;
      } catch (error) {
        if (error instanceof ErrorDeApi && error.codigo === 'VISITA_DUPLICADA') {
          await borrarPendiente(db, pendiente.id); // el servidor ya la tenía: no hay nada que subir
          continue;
        }
        quedan = pendientes.length - i; // ésta y las que siguen, para reintentar después
        break;
      }
    }
    return { subidas, pendientes: quedan };
  } finally {
    enCurso = false;
  }
}