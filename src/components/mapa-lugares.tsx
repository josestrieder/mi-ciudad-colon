import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Coordenadas, Lugar } from '@/tipos';

// Centro de Colón (Entre Ríos). El delta es el zoom: cuántos grados entran en pantalla.
const REGION_COLON = {
  latitude: -32.2235,
  longitude: -58.1403,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

// El APK sin clave de Google no puede crear el mapa nativo: el perfil "preview" lo apaga (ver eas.json).
const MAPA_ACTIVO = process.env.EXPO_PUBLIC_MAPA !== '0';

type Props = { lugares: Lugar[]; usuario: Coordenadas | null };

export function MapaLugares({ lugares, usuario }: Props) {
  if (!MAPA_ACTIVO) {
    return (
      <ThemedView type="backgroundElement" style={styles.sinMapa}>
        <ThemedText themeColor="textSecondary" style={styles.textoSinMapa}>
          El mapa no está disponible en esta versión. Usá la lista de lugares y el botón «Cómo llegar».
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <MapView style={styles.mapa} initialRegion={REGION_COLON} showsUserLocation={usuario !== null}>
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
  mapa: { width: '100%', height: 280 },
  sinMapa: { padding: 16, borderRadius: 12, justifyContent: 'center' },
  textoSinMapa: { textAlign: 'center' },
});