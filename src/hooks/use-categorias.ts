import { useQuery } from '@tanstack/react-query';

import { listarCategorias } from '@/servicios/lugares';

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: async () => (await listarCategorias()).datos,
  });
}