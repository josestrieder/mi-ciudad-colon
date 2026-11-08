import * as Location from 'expo-location';
import { Linking, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type Props = {
  permiso: Location.LocationPermissionResponse | null;
  onPedir: () => void;
};

export function AvisoUbicacion({ permiso, onPedir }: Props) {
  if (!permiso || permiso.granted) return null; // resolviendo o ya concedido

  const puedePedir = permiso.canAskAgain;

  return (
    <ThemedView type="backgroundElement" style={styles.aviso}>
      <ThemedText style={styles.titulo}>Ver lo que tenés cerca</ThemedText>
      <ThemedText themeColor="textSecondary">
        {puedePedir
          ? 'Con tu ubicación te mostramos primero los lugares más cercanos a vos.'
          : 'Rechazaste el permiso de ubicación. Si querés ver los lugares más cercanos, activalo desde los Ajustes del teléfono.'}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        onPress={puedePedir ? onPedir : () => Linking.openSettings()}
        style={styles.boton}>
        <ThemedText style={styles.textoBoton}>
          {puedePedir ? 'Activar ubicación' : 'Abrir ajustes'}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  aviso: { padding: 16, borderRadius: 12, gap: 8 },
  titulo: { fontWeight: '700' },
  boton: {
    backgroundColor: '#208AEF',
    paddingHorizontal: 24,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  textoBoton: { color: '#ffffff', fontWeight: '700' },
});