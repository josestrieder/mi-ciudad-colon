import { useQuery } from '@tanstack/react-query';

import { listarEventos } from '@/servicios/eventos';

export function useEventos() {
  return useQuery({
    queryKey: ['eventos'],
    queryFn: async () => {
      const { datos } = await listarEventos();
      return datos.filter((evento) => evento.estado !== 'finalizado'); // lo ideal: que lo filtre la API
    },
  });
}