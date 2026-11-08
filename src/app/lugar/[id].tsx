import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLugar } from '@/hooks/use-lugar';
import { horarioDeHoy } from '@/utils/horarios';

export default function DetalleLugar() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: lugar, isPending, isError, error, refetch } = useLugar(id);

  if (isPending) {
    return (
      <ThemedView style={styles.centro}>
        <ActivityIndicator size="large" />
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

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <Stack.Screen options={{ title: lugar.nombre }} />
      <ThemedText type="subtitle">{lugar.nombre}</ThemedText>
      <ThemedText themeColor="textSecondary">{lugar.direccion}</ThemedText>
      <ThemedText>{lugar.descripcion}</ThemedText>
      <ThemedText type="small">{horarioDeHoy(lugar.horarios)}</ThemedText>
      {lugar.telefono ? <ThemedText type="small">Tel. {lugar.telefono}</ThemedText> : null}
      <ThemedText type="small">
        {lugar.accesible ? 'Accesible' : 'Accesibilidad no informada'}
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  texto: { textAlign: 'center' },
  contenido: { padding: 16, gap: 12 },
  boton: {
    backgroundColor: '#208AEF',
    paddingHorizontal: 24,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
  },
  textoBoton: { color: '#ffffff', fontWeight: '700' },
});