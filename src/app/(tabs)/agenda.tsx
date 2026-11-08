import { ActivityIndicator, Pressable, RefreshControl, SectionList, StyleSheet } from 'react-native';

import { TarjetaEvento } from '@/components/tarjeta-evento';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEventos } from '@/hooks/use-eventos';
import { agruparPorDia } from '@/utils/fechas';

export default function Agenda() {
  const { data: eventos, isPending, isError, error, refetch, isRefetching } = useEventos();

  if (isPending) {
    return (
      <ThemedView style={styles.centro}>
        <ActivityIndicator size="large" />
        <ThemedText themeColor="textSecondary">Cargando eventos…</ThemedText>
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

  if (eventos.length === 0) {
    return (
      <ThemedView style={styles.centro}>
        <ThemedText type="subtitle">Sin eventos</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.texto}>
          No hay eventos próximos para mostrar.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <SectionList
      sections={agruparPorDia(eventos)}
      keyExtractor={(evento) => evento.id}
      renderItem={({ item }) => <TarjetaEvento evento={item} />}
      renderSectionHeader={({ section }) => (
        <ThemedView style={styles.encabezado}>
          <ThemedText style={styles.tituloDia}>{section.title}</ThemedText>
        </ThemedView>
      )}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      contentContainerStyle={styles.lista}
    />
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  texto: { textAlign: 'center' },
  lista: { padding: 16, gap: 12 },
  encabezado: { paddingTop: 8 },
  tituloDia: { fontSize: 16, fontWeight: '700' },
  boton: {
    backgroundColor: '#208AEF',
    paddingHorizontal: 24,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
  },
  textoBoton: { color: '#ffffff', fontWeight: '700' },
});