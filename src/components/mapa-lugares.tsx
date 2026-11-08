import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { Coordenadas, Lugar } from '@/tipos';

// Centro de Colón (Entre Ríos). El delta es el zoom: cuántos grados entran en pantalla.
const REGION_COLON = {
  latitude: -32.2235,
  longitude: -58.1403,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

type Props = { lugares: Lugar[]; usuario: Coordenadas | null };

export function MapaLugares({ lugares, usuario }: Props) {
  return (
    <MapView
      style={styles.mapa}
      initialRegion={REGION_COLON}
      showsUserLocation={usuario !== null}>
      {lugares.map((lugar) => (
        <Marker
          key={lugar.id}
          coordinate={{
            latitude: lugar.coordenadas.latitud,
            longitude: lugar.coordenadas.longitud,
          }}
          title={lugar.nombre}
          description={lugar.descripcionCorta}
          onCalloutPress={() => router.push(`/lugar/${lugar.id}`)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  mapa: { height: 280 },
});