import { queryOptions, useQuery } from '@tanstack/react-query';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

import { guardarLugares, leerLugares } from '@/servicios/cache-lugares';
import { listarLugares } from '@/servicios/lugares';
import type { Lugar } from '@/tipos';
import { ahoraEnColon } from '@/utils/fechas';

type Catalogo = { lugares: Lugar[]; desdeCache: boolean; sincronizadoEn: string | null };

function opcionesLugares(db: SQLiteDatabase) {
  return queryOptions({
    queryKey: ['lugares'],
    queryFn: async (): Promise<Catalogo> => {
      let lugares: Lugar[];
      try {
        lugares = (await listarLugares()).datos;
      } catch (error) {
        // Sin servidor: mostramos lo último que guardamos. Nunca una pantalla en blanco.
        const guardado = await leerLugares(db);
        if (guardado.lugares.length === 0) throw error; // no hay nada guardado: que se vea el error
        return { ...guardado, desdeCache: true };
      }

      let sincronizadoEn: string | null = ahoraEnColon();
      try {
        sincronizadoEn = await guardarLugares(db, lugares);
      } catch {
        // Si no se pudo guardar, seguimos con lo que acaba de llegar.
      }
      return { lugares, desdeCache: false, sincronizadoEn };
    },
  });
}

/** La lista de lugares. Funciona igual con o sin conexión. */
export function useLugares() {
  const db = useSQLiteContext();
  return useQuery({ ...opcionesLugares(db), select: (catalogo) => catalogo.lugares });
}

/** Si lo que se ve viene del teléfono (y de cuándo es). Comparte la misma consulta, no pide nada dos veces. */
export function useEstadoCatalogo() {
  const db = useSQLiteContext();
  return useQuery({
    ...opcionesLugares(db),
    select: (catalogo) => ({
      desdeCache: catalogo.desdeCache,
      sincronizadoEn: catalogo.sincronizadoEn,
    }),
  });
}