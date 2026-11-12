import Ionicons from '@react-native-vector-icons/ionicons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Audioguia } from '@/tipos';
import { formatearTiempo } from '@/utils/tiempo';

const SALTO_SEGUNDOS = 15;
const ESPERA_MAXIMA_MS = 12_000;

export function ReproductorAudioguia({ audioguia }: { audioguia: Audioguia }) {
  const player = useAudioPlayer(audioguia.url);
  // El reproductor no es estado de React: hay que escuchar su estado.
  const estado = useAudioPlayerStatus(player);
  const [tardando, setTardando] = useState(false);

  // Si el audio no carga (por ejemplo, sin señal), no dejamos un spinner eterno.
  useEffect(() => {
    if (estado.isLoaded) {
      setTardando(false);
      return;
    }
    const espera = setTimeout(() => setTardando(true), ESPERA_MAXIMA_MS);
    return () => clearTimeout(espera);
  }, [estado.isLoaded]);

  // Al terminar, vuelve al principio.
  useEffect(() => {
    if (estado.didJustFinish) player.seekTo(0);
  }, [estado.didJustFinish, player]);

  const total = estado.duration > 0 ? estado.duration : audioguia.duracionSegundos;
  const actual = Math.min(estado.currentTime, total);
  const progreso = total > 0 ? actual / total : 0;

  function alternar() {
    if (estado.playing) player.pause();
    else player.play();
  }

  function saltar(delta: number) {
    player.seekTo(Math.min(Math.max(0, estado.currentTime + delta), total));
  }

  function reintentar() {
    setTardando(false);
    player.replace(audioguia.url);
  }

  if (!estado.isLoaded && tardando) {
    return (
      <ThemedView type="backgroundElement" style={styles.tarjeta}>
        <ThemedText style={styles.titulo}>Audioguía</ThemedText>
        <ThemedText themeColor="textSecondary">
          No pudimos cargar el audio. Revisá tu conexión e intentá de nuevo.
        </ThemedText>
        <Pressable accessibilityRole="button" onPress={reintentar} style={styles.reintentar}>
          <ThemedText style={styles.textoReintentar}>Reintentar</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (!estado.isLoaded) {
    return (
      <ThemedView type="backgroundElement" style={[styles.tarjeta, styles.cargando]}>
        <ActivityIndicator />
        <ThemedText themeColor="textSecondary">Cargando la audioguía…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView type="backgroundElement" style={styles.tarjeta}>
      <ThemedText style={styles.titulo}>Escuchar audioguía · {formatearTiempo(total)}</ThemedText>

      <View style={styles.controles}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Retroceder ${SALTO_SEGUNDOS} segundos`}
          onPress={() => saltar(-SALTO_SEGUNDOS)}
          style={styles.botonChico}>
          <Ionicons name="play-back" size={28} color="#208AEF" />
          <ThemedText type="small">{SALTO_SEGUNDOS} s</ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={estado.playing ? 'Pausar la audioguía' : 'Reproducir la audioguía'}
          onPress={alternar}
          style={styles.botonGrande}>
          <Ionicons name={estado.playing ? 'pause' : 'play'} size={36} color="#ffffff" />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Adelantar ${SALTO_SEGUNDOS} segundos`}
          onPress={() => saltar(SALTO_SEGUNDOS)}
          style={styles.botonChico}>
          <Ionicons name="play-forward" size={28} color="#208AEF" />
          <ThemedText type="small">{SALTO_SEGUNDOS} s</ThemedText>
        </Pressable>
      </View>

      <View style={styles.barra}>
        <View style={[styles.relleno, { width: `${progreso * 100}%` }]} />
      </View>
      <View style={styles.tiempos}>
        <ThemedText type="small">{formatearTiempo(actual)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Faltan {formatearTiempo(total - actual)}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tarjeta: { padding: 16, borderRadius: 12, gap: 12 },
  cargando: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titulo: { fontWeight: '700', fontSize: 16 },
  controles: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  botonChico: { minWidth: 56, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  botonGrande: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barra: { height: 8, borderRadius: 4, backgroundColor: '#D1D5DB', overflow: 'hidden' },
  relleno: { height: 8, backgroundColor: '#208AEF' },
  tiempos: { flexDirection: 'row', justifyContent: 'space-between' },
  reintentar: {
    backgroundColor: '#208AEF',
    paddingHorizontal: 24,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  textoReintentar: { color: '#ffffff', fontWeight: '700' },
});