import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { useUsuarioId } from '@/hooks/use-usuario-id';
import { ErrorDeApi } from '@/servicios/cliente';
import {
  actualizarVisita,
  eliminarVisita,
  listarVisitas,
  registrarVisita,
  type CambiosVisita,
} from '@/servicios/visitas';
import {
  aVisita,
  borrarPendiente,
  guardarCopiaVisitas,
  guardarPendiente,
  leerCopiaVisitas,
  leerPendientes,
} from '@/servicios/visitas-locales';
import type { OrigenVisita, Visita } from '@/tipos';

const ordenarPorFecha = (lista: Visita[]) =>
  [...lista].sort((a, b) => b.fechaHora.localeCompare(a.fechaHora)); // la más nueva primero

/** Las visitas del servidor más las pendientes. Sin conexión, la última copia guardada. */
export function useVisitas() {
  const db = useSQLiteContext();
  const usuarioId = useUsuarioId();

  return useQuery({
    queryKey: ['visitas', usuarioId],
    queryFn: async () => {
      if (!usuarioId) return [];
      const pendientes = (await leerPendientes(db, usuarioId)).map(aVisita);

      let delServidor: Visita[];
      try {
        delServidor = (await listarVisitas(usuarioId)).datos;
      } catch (error) {
        const copia = await leerCopiaVisitas(usuarioId);
        if (!copia && pendientes.length === 0) throw error; // nada que mostrar: que se vea el error
        return ordenarPorFecha([...pendientes, ...(copia ?? [])]);
      }

      try {
        await guardarCopiaVisitas(usuarioId, delServidor);
      } catch {
        // Si no se pudo guardar la copia, seguimos con lo que llegó.
      }
      return ordenarPorFecha([...pendientes, ...delServidor]);
    },
    enabled: usuarioId !== null,
  });
}

export function useRegistrarVisita() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const usuarioId = useUsuarioId();

  return useMutation({
    mutationFn: async ({ lugarId, origen }: { lugarId: string; origen: OrigenVisita }) => {
      if (!usuarioId) throw new Error('Necesitás una cuenta para guardar tu recorrido.');
      try {
        return await registrarVisita(usuarioId, lugarId, origen);
      } catch (error) {
        if (error instanceof ErrorDeApi && error.codigo === 'SIN_CONEXION') {
          // Sin conexión: se guarda en el teléfono y se sube cuando vuelva la red.
          return guardarPendiente(db, usuarioId, lugarId, origen);
        }
        throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visitas', usuarioId] }),
  });
}

export function useActualizarVisita() {
  const queryClient = useQueryClient();
  const usuarioId = useUsuarioId();

  return useMutation({
    mutationFn: async ({ visitaId, cambios }: { visitaId: string; cambios: CambiosVisita }) => {
      if (!usuarioId) throw new Error('Necesitás una cuenta para guardar tu recorrido.');
      return actualizarVisita(usuarioId, visitaId, cambios);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visitas', usuarioId] }),
  });
}

export function useEliminarVisita() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const usuarioId = useUsuarioId();

  return useMutation({
    mutationFn: async (visitaId: string) => {
      if (!usuarioId) throw new Error('Necesitás una cuenta para guardar tu recorrido.');
      if (visitaId.startsWith('local-')) {
        await borrarPendiente(db, visitaId); // todavía no se había subido: alcanza con borrarla del teléfono
        return;
      }
      return eliminarVisita(usuarioId, visitaId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visitas', usuarioId] }),
  });
}