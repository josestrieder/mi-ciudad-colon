import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useUsuarioId } from '@/hooks/use-usuario-id';
import { pedirPermisoAvisos } from '@/servicios/notificaciones';
import {
  cancelarRecordatorio,
  leerRecordatorios,
  programarRecordatorio,
} from '@/servicios/recordatorios';
import type { Evento } from '@/tipos';
import { confirmacionHaptica } from '@/utils/haptica';

export type ResultadoAlternar =
  | { tipo: 'activado'; inmediato: boolean }
  | { tipo: 'desactivado' }
  | { tipo: 'sin-permiso' }
  | { tipo: 'bloqueado' }
  | { tipo: 'ya-empezo' };

export function useRecordatorios() {
  const usuarioId = useUsuarioId();
  return useQuery({
    queryKey: ['recordatorios', usuarioId],
    queryFn: async (): Promise<Record<string, string>> =>
      usuarioId ? leerRecordatorios(usuarioId) : {},
    enabled: usuarioId !== null,
  });
}

export function useAlternarRecordatorio() {
  const queryClient = useQueryClient();
  const usuarioId = useUsuarioId();

  return useMutation({
    mutationFn: async ({ evento, activo }: { evento: Evento; activo: boolean }): Promise<ResultadoAlternar> => {
      if (!usuarioId) throw new Error('Necesitás una cuenta para guardar eventos.');

      if (activo) {
        await cancelarRecordatorio(usuarioId, evento.id);
        return { tipo: 'desactivado' };
      }

      // El permiso se pide recién ahora, cuando el usuario activa algo que lo necesita.
      const permiso = await pedirPermisoAvisos();
      if (permiso === 'denegado') return { tipo: 'sin-permiso' };
      if (permiso === 'bloqueado') return { tipo: 'bloqueado' };

      const resultado = await programarRecordatorio(usuarioId, evento);
      if (resultado.tipo === 'ya-empezo') return { tipo: 'ya-empezo' };
      return { tipo: 'activado', inmediato: resultado.inmediato };
    },
    onSuccess: (resultado) => {
      if (resultado.tipo === 'activado') confirmacionHaptica();
      queryClient.invalidateQueries({ queryKey: ['recordatorios', usuarioId] });
    },
  });
}