import { useQuery } from '@tanstack/react-query';

import { obtenerLugar } from '@/servicios/lugares';

export function useLugar(id: string) {
  return useQuery({
    queryKey: ['lugar', id],
    queryFn: () => obtenerLugar(id),
  });
}