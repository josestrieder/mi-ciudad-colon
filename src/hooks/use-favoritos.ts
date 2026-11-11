import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSesion } from '@/contexto/sesion';
import { agregarFavorito, listarFavoritos, quitarFavorito } from '@/servicios/favoritos';
import type { Favorito } from '@/tipos';

function useUsuarioId(): string | null {
  const { estado } = useSesion();
  return estado.fase === 'con-sesion' ? estado.usuario.id : null;
}

export function useFavoritos() {
  const usuarioId = useUsuarioId();
  return useQuery({
    queryKey: ['favoritos', usuarioId],
    queryFn: async () => (usuarioId ? (await listarFavoritos(usuarioId)).datos : []),
    enabled: usuarioId !== null,
  });
}

type Cambio = { lugarId: string; esFavorito: boolean };

export function useAlternarFavorito() {
  const queryClient = useQueryClient();
  const usuarioId = useUsuarioId();
  const clave = ['favoritos', usuarioId];

  return useMutation({
    mutationFn: async ({ lugarId, esFavorito }: Cambio) => {
      if (!usuarioId) throw new Error('Necesitás una cuenta para guardar favoritos.');
      if (esFavorito) await quitarFavorito(usuarioId, lugarId);
      else await agregarFavorito(usuarioId, lugarId);
    },

    onMutate: async ({ lugarId, esFavorito }: Cambio) => {
      await queryClient.cancelQueries({ queryKey: clave });
      const previo = queryClient.getQueryData<Favorito[]>(clave); // guardar por si falla

      queryClient.setQueryData<Favorito[]>(clave, (actuales = []) =>
        esFavorito
          ? actuales.filter((f) => f.lugarId !== lugarId) // pintar YA
          : [
              ...actuales,
              {
                id: `tmp-${lugarId}`,
                usuarioId: usuarioId ?? '',
                lugarId,
                creadoEn: new Date().toISOString(),
              },
            ],
      );
      return { previo };
    },

    onError: (_error, _cambio, contexto) => {
      queryClient.setQueryData(clave, contexto?.previo); // volver atrás: sin esto la pantalla miente
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: clave }),
  });
}