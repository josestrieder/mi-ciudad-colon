import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { TarjetaLugar } from '@/components/tarjeta-lugar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSesion } from '@/contexto/sesion';
import { useFavoritos } from '@/hooks/use-favoritos';
import { useLugares } from '@/hooks/use-lugares';

export default function Favoritos() {
  const { estado } = useSesion();
  const favoritos = useFavoritos();
  const lugares = useLugares();

  if (estado.fase !== 'con-sesion') {
    return (
      <ThemedView style={styles.centro}>
        <ThemedText type="subtitle">Tus favoritos</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.texto}>
          Ingresá a tu cuenta para guardar y ver tus lugares favoritos.
        </ThemedText>
        <Pressable accessibilityRole="button" onPress={() => router.push('/yo')} style={styles.boton}>
          <ThemedText style={styles.textoBoton}>Ir a mi cuenta</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (favoritos.isPending || lugares.isPending) {
    return (
      <ThemedView style={styles.centro}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (favoritos.isError || lugares.isError) {
    return (
      <ThemedView style={styles.centro}>
        <ThemedText type="subtitle">Ups</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.texto}>
          No pudimos cargar tus favoritos.
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            favoritos.refetch();
            lugares.refetch();
          }}
          style={styles.boton}>
          <ThemedText style={styles.textoBoton}>Reintentar</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const ids = new Set(favoritos.data.map((f) => f.lugarId));
  const guardados = lugares.data.filter((lugar) => ids.has(lugar.id));

  if (guardados.length === 0) {
    return (
      <ThemedView style={styles.centro}>
        <ThemedText type="subtitle">Sin favoritos</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.texto}>
          Todavía no marcaste ninguno. Tocá el corazón en un lugar para guardarlo.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <FlatList
      data={guardados}
      keyExtractor={(lugar) => lugar.id}
      renderItem={({ item }) => <TarjetaLugar lugar={item} />}
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