import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { BotonRecordatorio } from '@/components/boton-recordatorio';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Evento } from '@/tipos';
import { horaDe } from '@/utils/fechas';

function textoPrecio(precio: number | null): string | null {
  if (precio === null) return null;
  if (precio === 0) return 'Gratis';
  return `$ ${precio.toLocaleString('es-AR')}`;
}

const AVISOS: Partial<Record<Evento['estado'], { texto: string; color: string }>> = {
  suspendido: { texto: 'Suspendido', color: '#B45309' },
  cancelado: { texto: 'Cancelado', color: '#B91C1C' },
};

export function TarjetaEvento({ evento }: { evento: Evento }) {
  const precio = textoPrecio(evento.precio);
  const aviso = AVISOS[evento.estado];
  const lugarId = evento.lugarId;

  const contenido = (
    <ThemedView type="backgroundElement" style={styles.tarjeta}>
      <ThemedText type="small">{horaDe(evento.inicio)} hs</ThemedText>
      {aviso ? (
        <ThemedText style={[styles.aviso, { color: aviso.color }]}>{aviso.texto}</ThemedText>
      ) : null}
      <ThemedText numberOfLines={2} style={styles.titulo}>
        {evento.titulo}
      </ThemedText>
      {evento.direccionLibre ? (
        <ThemedText themeColor="textSecondary" numberOfLines={2}>
          {evento.direccionLibre}
        </ThemedText>
      ) : null}
      {precio ? <ThemedText type="small">{precio}</ThemedText> : null}
      {lugarId ? (
        <ThemedText type="small" themeColor="textSecondary">
          Tocá para ver el lugar
        </ThemedText>
      ) : null}
      <BotonRecordatorio evento={evento} />
    </ThemedView>
  );

  if (!lugarId) return contenido;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver el lugar de ${evento.titulo}`}
      onPress={() => router.push(`/lugar/${lugarId}`)}>
      {contenido}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: { padding: 16, borderRadius: 12, gap: 4 },
  titulo: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
  aviso: { fontWeight: '700' },
});