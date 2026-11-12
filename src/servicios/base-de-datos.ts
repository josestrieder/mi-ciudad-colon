import type { SQLiteDatabase } from 'expo-sqlite';

export const NOMBRE_BD = 'mi-ciudad.db';

/** Crea o actualiza las tablas. Corre una vez al abrir la base, antes de pintar nada. */
export async function migrar(db: SQLiteDatabase) {
  const VERSION = 2;
  const fila = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let actual = fila?.user_version ?? 0;
  if (actual >= VERSION) return;

  if (actual === 0) {
    await db.execAsync(`PRAGMA journal_mode = 'wal';
      CREATE TABLE lugares (
        id TEXT PRIMARY KEY NOT NULL,
        categoria_id TEXT NOT NULL,
        nombre TEXT NOT NULL,
        activo INTEGER NOT NULL DEFAULT 1,
        datos TEXT NOT NULL
      );
      CREATE TABLE meta (
        clave TEXT PRIMARY KEY NOT NULL,
        valor TEXT NOT NULL
      );`);
    actual = 1;
  }

  if (actual === 1) {
    await db.execAsync(`CREATE TABLE visitas_pendientes (
        id TEXT PRIMARY KEY NOT NULL,
        usuario_id TEXT NOT NULL,
        lugar_id TEXT NOT NULL,
        origen TEXT NOT NULL,
        fecha_hora TEXT NOT NULL
      );`);
    actual = 2;
  }

  await db.execAsync(`PRAGMA user_version = ${VERSION}`);
}