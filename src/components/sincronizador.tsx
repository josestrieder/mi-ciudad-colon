import { useNetworkState } from 'expo-network';
import { useEffect } from 'react';

import { useSincronizar } from '@/hooks/use-sincronizar';
import { useUsuarioId } from '@/hooks/use-usuario-id';

export function Sincronizador() {
  const red = useNetworkState();
  const usuarioId = useUsuarioId();
  const { mutate } = useSincronizar();
  const hayInternet = red.isInternetReachable === true;

  useEffect(() => {
    if (hayInternet && usuarioId) mutate();
  }, [hayInternet, usuarioId, mutate]);

  return null;
}