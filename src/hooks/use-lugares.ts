import { useQuery } from '@tanstack/react-query';

import { listarLugares } from '@/servicios/lugares';

export function useLugares() {
  return useQuery({
    queryKey: ['lugares'],
    queryFn: async () => (await listarLugares()).datos,
  });
}