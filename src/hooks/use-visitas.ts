import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useUsuarioId } from '@/hooks/use-usuario-id';
import { listarVisitas, registrarVisita } from '@/servicios/visitas';

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