import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert } from 'react-native';

import { useUsuarioId } from '@/hooks/use-usuario-id';
import { subirPendientes } from '@/servicios/sincronizacion';

export function useSincronizar() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const usuarioId = useUsuarioId();

  return useMutation({
    mutationFn: async () => {
      if (!usuarioId) return { subidas: 0, pendientes: 0 };
      return subirPendientes(db, usuarioId);
    },
    onSuccess: ({ subidas, pendientes }) => {
      queryClient.invalidateQueries({ queryKey: ['visitas', usuarioId] });
      if (subidas === 0 && pendientes === 0) return; // no había nada: no molestamos

      // Decir con claridad qué se envió y qué no.
      const partes: string[] = [];
      if (subidas > 0) {
        partes.push(subidas === 1 ? 'Se subió 1 visita pendiente.' : `Se subieron ${subidas} visitas pendientes.`);
      }
      if (pendientes > 0) {
        partes.push(
          pendientes === 1
            ? 'Sigue pendiente 1 visita: se va a reintentar.'
            : `Siguen pendientes ${pendientes} visitas: se van a reintentar.`,
        );
      }
      Alert.alert('Visitas', partes.join('\n'));
    },
  });
}