import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { AvisoUbicacion } from '@/components/aviso-ubicacion';
import { MapaLugares } from '@/components/mapa-lugares';
import { TarjetaLugar } from '@/components/tarjeta-lugar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLugares } from '@/hooks/use-lugares';
import { useUbicacion } from '@/hooks/use-ubicacion';
import { distanciaMetros } from '@/utils/distancia';

export default function Mapa() {
  const { data: lugares, isPending, isError, error, refetch } = useLugares();
  const { permiso, pedirPermiso, coordenadas } = useUbicacion();

  if (isPending) {
    return (
      <ThemedView style={styles.centro}>
        <ActivityIndicator size="large" />
        <ThemedText themeColor="textSecondary">Cargando lugares…</ThemedText>
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.centro}>
        <ThemedText type="subtitle">Ups</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.texto}>
          {error.message}
        </ThemedText>
        <Pressable accessibilityRole="button" onPress={() => refetch()} style={styles.boton}>
          <ThemedText style={styles.textoBoton}>Reintentar</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (lugares.length === 0) {
    return (
      <ThemedView style={styles.centro}>
        <ThemedText type="subtitle">Sin lugares</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.texto}>
          Todavía no hay lugares para mostrar.
        </ThemedText>
      </ThemedView>
    );
  }

  const items = lugares.map((lugar) => ({
    lugar,
    distancia: coordenadas ? distanciaMetros(coordenadas, lugar.coordenadas) : null,
  }));
  if (coordenadas) items.sort((a, b) => (a.distancia ?? 0) - (b.distancia ?? 0));

  return (
    <ThemedView style={styles.pantalla}>
      <MapaLugares lugares={lugares} usuario={coordenadas} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.lugar.id}
        renderItem={({ item }) => (
          <TarjetaLugar lugar={item.lugar} distanciaMetros={item.distancia} />
        )}
        ListHeaderComponent={<AvisoUbicacion permiso={permiso} onPedir={pedirPermiso} />}
        contentContainerStyle={styles.lista}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  texto: { textAlign: 'center' },
  lista: { padding: 16, gap: 12 },
  boton: {
    backgroundColor: '#208AEF',
    paddingHorizontal: 24,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
  },
  textoBoton: { color: '#ffffff', fontWeight: '700' },
});