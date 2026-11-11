import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useUsuarioId } from '@/hooks/use-usuario-id';
import {
  actualizarVisita,
  eliminarVisita,
  listarVisitas,
  registrarVisita,
  type CambiosVisita,
} from '@/servicios/visitas';

export function useVisitas() {
  const usuarioId = useUsuarioId();
  return useQuery({
    queryKey: ['visitas', usuarioId],
    queryFn: async () => (usuarioId ? (await listarVisitas(usuarioId)).datos : []),
    enabled: usuarioId !== null,
  });
}

export function useRegistrarVisita() {
  const queryClient = useQueryClient();
  const usuarioId = useUsuarioId();

  return useMutation({
    mutationFn: async (lugarId: string) => {
      if (!usuarioId) throw new Error('Necesitás una cuenta para guardar tu recorrido.');
      return registrarVisita(usuarioId, lugarId, 'manual');
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
  const queryClient = useQueryClient();
  const usuarioId = useUsuarioId();

  return useMutation({
    mutationFn: async (visitaId: string) => {
      if (!usuarioId) throw new Error('Necesitás una cuenta para guardar tu recorrido.');
      return eliminarVisita(usuarioId, visitaId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visitas', usuarioId] }),
  });
}