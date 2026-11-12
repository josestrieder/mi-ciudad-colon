import { useQuery } from '@tanstack/react-query';

import { listarEventos } from '@/servicios/eventos';
import { limpiarRecordatoriosInvalidos } from '@/servicios/recordatorios';

export function useEventos() {
  return useQuery({
    queryKey: ['eventos'],
    queryFn: async () => {
      const { datos } = await listarEventos();
      try {
        await limpiarRecordatoriosInvalidos(datos);
      } catch {
        // Si no se pudo limpiar, no es motivo para no mostrar la agenda.
      }
      return datos.filter((evento) => evento.estado !== 'finalizado'); // lo ideal: que lo filtre la API
    },
  });
}