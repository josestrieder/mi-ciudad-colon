import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Lugar } from '@/tipos';
import { formatearDistancia } from '@/utils/distancia';

function textoPrecio(precio: number | null): string | null {
  if (precio === null) return null;
  if (precio === 0) return 'Entrada gratuita';
  return `Entrada $ ${precio.toLocaleString('es-AR')}`;
}

type Props = { lugar: Lugar; distanciaMetros?: number | null };

export function TarjetaLugar({ lugar, distanciaMetros }: Props) {
  const precio = textoPrecio(lugar.precioEntrada);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver ${lugar.nombre}`}
      onPress={() => router.push(`/lugar/${lugar.id}`)}>
      <ThemedView type="backgroundElement" style={styles.tarjeta}>
        <ThemedText numberOfLines={2} style={styles.nombre}>
          {lugar.nombre}
        </ThemedText>
        <ThemedText themeColor="textSecondary" numberOfLines={2}>
          {lugar.descripcionCorta}
        </ThemedText>
        {distanciaMetros != null && (
          <ThemedText type="small">A {formatearDistancia(distanciaMetros)}</ThemedText>
        )}
        {precio && <ThemedText type="small">{precio}</ThemedText>}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: { padding: 16, borderRadius: 12, gap: 4 },
  nombre: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
});