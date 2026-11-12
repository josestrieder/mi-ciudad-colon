import Ionicons from '@react-native-vector-icons/ionicons';
import { Alert, Linking, Platform, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type Props = { latitud: number; longitud: number; nombre: string };

/** Enlace que abre la app de mapas del teléfono con la ruta desde donde estás hasta el lugar. */
function enlaceDeRuta(latitud: number, longitud: number): string {
  const destino = `${latitud},${longitud}`;
  if (Platform.OS === 'ios') {
    return `https://maps.apple.com/?daddr=${destino}&dirflg=d`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destino}&travelmode=driving`;
}

export function BotonComoLlegar({ latitud, longitud, nombre }: Props) {
  async function abrir() {
    try {
      await Linking.openURL(enlaceDeRuta(latitud, longitud));
    } catch {
      Alert.alert(
        'No pudimos abrir el mapa',
        'Revisá que tengas una app de mapas o un navegador instalado.',
      );
    }
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Cómo llegar a ${nombre}`}
      onPress={abrir}
      style={styles.boton}>
      <Ionicons name="navigate" size={22} color="#ffffff" />
      <ThemedText style={styles.texto}>Cómo llegar</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#208AEF',
    paddingHorizontal: 24,
    minHeight: 48,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  texto: { color: '#ffffff', fontWeight: '700' },
});