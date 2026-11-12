import Ionicons from '@react-native-vector-icons/ionicons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Audioguia } from '@/tipos';
import { archivoDeAudioguia, borrarAudioguia, descargarAudioguia } from '@/utils/audioguias';
import { formatearTiempo } from '@/utils/tiempo';

const SALTO_SEGUNDOS = 15;
const ESPERA_MAXIMA_MS = 12_000;
// Se prende solo al compilar el APK (ver eas.json). En Expo Go no existen los servicios de fondo.
const SEGUNDO_PLANO = process.env.EXPO_PUBLIC_SEGUNDO_PLANO === '1';

type Props = { audioguia: Audioguia; lugarId: string; titulo: string };
type Descarga = 'no' | 'bajando' | 'lista' | 'error';

export function ReproductorAudioguia({ audioguia, lugarId, titulo }: Props) {
  // Si ya la bajamos, suena desde el teléfono; si no (o si el sistema vació la caché), desde internet.
  const [fuenteInicial] = useState(() => {
    const archivo = archivoDeAudioguia(lugarId, audioguia);
    return archivo.exists ? archivo.uri : audioguia.url;
  });
  const player = useAudioPlayer(fuenteInicial);
  // El reproductor no es estado de React: hay que escuchar su estado.
  const estado = useAudioPlayerStatus(player);

  const [tardando, setTardando] = useState(false);
  const [descarga, setDescarga] = useState<Descarga>(() =>
    archivoDeAudioguia(lugarId, audioguia).exists ? 'lista' : 'no',
  );
  const [avance, setAvance] = useState(0);

  // Preparado para la pantalla apagada: solo se activa del todo en el APK.
  useEffect(() => {
    try {
      setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: SEGUNDO_PLANO,
        interruptionMode: 'doNotMix',
      });
    } catch {
      // Si no está disponible, seguimos sin él.
    }
  }, []);

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
    if (estado.playing) {
      player.pause();
      return;
    }
    if (SEGUNDO_PLANO) {
      try {
        // En Android, sin los controles de la pantalla de bloqueo el sistema corta el audio a los ~3 minutos.
        player.setActiveForLockScreen(true, { title: titulo, artist: 'Mi Ciudad Colón' });
      } catch {
        // Si no está disponible, sigue sonando con la app abierta.
      }
    }
    player.play();
  }

  function saltar(delta: number) {
    player.seekTo(Math.min(Math.max(0, estado.currentTime + delta), total));
  }

  function reintentar() {
    setTardando(false);
    player.replace(fuenteInicial);
  }

  async function descargar() {
    setDescarga('bajando');
    setAvance(0);
    try {
      const uri = await descargarAudioguia(lugarId, audioguia, setAvance);
      player.pause();
      player.replace(uri); // desde ahora suena desde el teléfono
      setDescarga('lista');
    } catch {
      setDescarga('error');
    }
  }

  function borrarDescarga() {
    borrarAudioguia(lugarId, audioguia);
    setDescarga('no');
    player.pause();
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

      {descarga === 'no' || descarga === 'error' ? (
        <View style={styles.descarga}>
          {descarga === 'error' ? (
            <ThemedText type="small" style={styles.error}>
              No se pudo descargar. Probá de nuevo.
            </ThemedText>
          ) : null}
          <Pressable accessibilityRole="button" onPress={descargar} style={styles.botonDescarga}>
            <Ionicons name="download-outline" size={20} color="#208AEF" />
            <ThemedText style={styles.textoDescarga}>Descargar para escuchar sin señal</ThemedText>
          </Pressable>
        </View>
      ) : null}

      {descarga === 'bajando' ? (
        <View style={styles.descarga}>
          <ThemedText type="small">Descargando… {Math.round(avance * 100)} %</ThemedText>
          <View style={styles.barra}>
            <View style={[styles.relleno, { width: `${avance * 100}%` }]} />
          </View>
        </View>
      ) : null}

      {descarga === 'lista' ? (
        <View style={styles.descarga}>
          <ThemedText type="small" themeColor="textSecondary">
            Guardada en el teléfono: suena sin señal.
          </ThemedText>
          <Pressable accessibilityRole="button" onPress={borrarDescarga}>
            <ThemedText type="linkPrimary">Borrar la descarga</ThemedText>
          </Pressable>
        </View>
      ) : null}
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
  descarga: { gap: 8, alignItems: 'flex-start' },
  botonDescarga: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#208AEF',
  },
  textoDescarga: { color: '#208AEF', fontWeight: '700' },
  error: { color: '#B91C1C', fontWeight: '700' },
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