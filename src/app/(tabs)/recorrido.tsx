import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { TarjetaVisita } from '@/components/tarjeta-visita';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSesion } from '@/contexto/sesion';
import { useLugares } from '@/hooks/use-lugares';
import { useVisitas } from '@/hooks/use-visitas';

export default function Recorrido() {
  const { estado } = useSesion();
  const visitas = useVisitas();
  const lugares = useLugares();

  if (estado.fase !== 'con-sesion') {
    return (
      <ThemedView style={styles.centro}>
        <ThemedText type="subtitle">Tu recorrido</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.texto}>
          Ingresá a tu cuenta para guardar los lugares que visitás.
        </ThemedText>
        <Pressable accessibilityRole="button" onPress={() => router.push('/yo')} style={styles.boton}>
          <ThemedText style={styles.textoBoton}>Ir a mi cuenta</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (visitas.isPending || lugares.isPending) {
    return (
      <ThemedView style={styles.centro}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (visitas.isError || lugares.isError) {
    return (
      <ThemedView style={styles.centro}>
        <ThemedText type="subtitle">Ups</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.texto}>
          No pudimos cargar tu recorrido.
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            visitas.refetch();
            lugares.refetch();
          }}
          style={styles.boton}>
          <ThemedText style={styles.textoBoton}>Reintentar</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (visitas.data.length === 0) {
    return (
      <ThemedView style={styles.centro}>
        <ThemedText type="subtitle">Todavía no hay visitas</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.texto}>
          Abrí un lugar y tocá «Marcar como visitado» para empezar tu recorrido.
        </ThemedText>
      </ThemedView>
    );
  }

  const nombres = new Map(lugares.data.map((lugar) => [lugar.id, lugar.nombre]));

  return (
    <FlatList
      data={visitas.data}
      keyExtractor={(visita) => visita.id}
      renderItem={({ item }) => (
        <TarjetaVisita visita={item} nombreLugar={nombres.get(item.lugarId) ?? 'Lugar'} />
      )}
      contentContainerStyle={styles.lista}
    />
  );
}

const styles = StyleSheet.create({
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