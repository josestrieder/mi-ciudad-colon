import type { SQLiteDatabase } from 'expo-sqlite';

import type { Lugar } from '@/tipos';
import { ahoraEnColon } from '@/utils/fechas';

type Fila = { datos: string };

/** Reemplaza el catálogo guardado por la última copia que llegó del servidor. */
export async function guardarLugares(db: SQLiteDatabase, lugares: Lugar[]): Promise<string> {
  const ahora = ahoraEnColon();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM lugares');
    for (const lugar of lugares) {
      await db.runAsync(
        'INSERT INTO lugares (id, categoria_id, nombre, activo, datos) VALUES (?, ?, ?, ?, ?)',
        [lugar.id, lugar.categoriaId, lugar.nombre, lugar.activo ? 1 : 0, JSON.stringify(lugar)],
      );
    }
    await db.runAsync('INSERT OR REPLACE INTO meta (clave, valor) VALUES (?, ?)', [
      'lugares_sincronizados_en',
      ahora,
    ]);
  });
  return ahora;
}

/** Los lugares guardados, en el mismo orden en que llegaron, y cuándo se guardaron. */
export async function leerLugares(
  db: SQLiteDatabase,
): Promise<{ lugares: Lugar[]; sincronizadoEn: string | null }> {
  const filas = await db.getAllAsync<Fila>('SELECT datos FROM lugares ORDER BY rowid');
  const meta = await db.getFirstAsync<{ valor: string }>('SELECT valor FROM meta WHERE clave = ?', [
    'lugares_sincronizados_en',
  ]);
  return {
    lugares: filas.map((fila) => JSON.parse(fila.datos) as Lugar),
    sincronizadoEn: meta?.valor ?? null,
  };
}

export async function leerLugar(db: SQLiteDatabase, id: string): Promise<Lugar | null> {
  const fila = await db.getFirstAsync<Fila>('SELECT datos FROM lugares WHERE id = ?', [id]);
  return fila ? (JSON.parse(fila.datos) as Lugar) : null;
}