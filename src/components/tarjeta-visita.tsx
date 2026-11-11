import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { OrigenVisita, Visita } from '@/tipos';
import { claveDia, horaDe, tituloDia } from '@/utils/fechas';
import { Image } from 'expo-image';

const TEXTO_ORIGEN: Record<OrigenVisita, string> = {
  qr: 'Registrada con QR',
  gps: 'Registrada por cercanía',
  manual: 'Registrada a mano',
};

type Props = { visita: Visita; nombreLugar: string };

export function TarjetaVisita({ visita, nombreLugar }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver ${nombreLugar}`}
      onPress={() => router.push(`/lugar/${visita.lugarId}`)}>
      <ThemedView type="backgroundElement" style={styles.tarjeta}>
        <ThemedText type="small" themeColor="textSecondary">
          {tituloDia(claveDia(visita.fechaHora))} · {horaDe(visita.fechaHora)} hs
        </ThemedText>
        <ThemedText numberOfLines={2} style={styles.nombre}>
          {nombreLugar}
        </ThemedText>
        <ThemedText type="small">{TEXTO_ORIGEN[visita.origen]}</ThemedText>
                {visita.fotoUri ? (
          <Image
            source={{ uri: visita.fotoUri }}
            style={styles.foto}
            contentFit="cover"
            transition={200}
          />
        ) : null}
        {visita.nota ? (
          <ThemedText themeColor="textSecondary" numberOfLines={3}>
            {visita.nota}
          </ThemedText>
        ) : null}
      </ThemedView>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  tarjeta: { padding: 16, borderRadius: 12, gap: 4 },
  nombre: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
  foto: { width: '100%', aspectRatio: 16 / 9, borderRadius: 8, marginTop: 4 },
});