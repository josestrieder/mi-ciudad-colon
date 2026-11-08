import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import type { Coordenadas } from '@/tipos';

function aCoordenadas(posicion: Location.LocationObject): Coordenadas {
  return { latitud: posicion.coords.latitude, longitud: posicion.coords.longitude };
}

export function useUbicacion() {
  const [permiso, pedirPermiso] = Location.useForegroundPermissions();
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
  const concedido = permiso?.granted ?? false;

  useEffect(() => {
    if (!concedido) return;
    let cancelado = false;

    async function ubicar() {
      try {
        const ultima = await Location.getLastKnownPositionAsync(); // rápida, puede ser vieja
        if (ultima && !cancelado) setCoordenadas(aCoordenadas(ultima));

        const actual = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // precisa, tarda
        });
        if (!cancelado) setCoordenadas(aCoordenadas(actual));
      } catch {
        // GPS apagado o sin señal: seguimos sin ubicación y la lista se ve igual.
      }
    }

    ubicar();
    return () => {
      cancelado = true;
    };
  }, [concedido]);

  return { permiso, pedirPermiso, coordenadas };
}