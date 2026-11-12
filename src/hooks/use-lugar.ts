import { useQuery } from '@tanstack/react-query';
import { useSQLiteContext } from 'expo-sqlite';

import { leerLugar } from '@/servicios/cache-lugares';
import { ErrorDeApi } from '@/servicios/cliente';
import { obtenerLugar } from '@/servicios/lugares';

export function useLugar(id: string) {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: ['lugar', id],
    queryFn: async () => {
      try {
        return await obtenerLugar(id);
      } catch (error) {
        // Si el servidor dice que no existe, no mostramos una copia vieja.
        if (error instanceof ErrorDeApi && error.codigo === 'LUGAR_NO_ENCONTRADO') throw error;
        const guardado = await leerLugar(db, id);
        if (guardado) return guardado;
        throw error;
      }
    },
  });
}