import { NetworkStateType, useNetworkState } from 'expo-network';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

function Barra({ texto, color }: { texto: string; color: string }) {
  return (
    <View accessibilityRole="alert" style={[styles.barra, { backgroundColor: color }]}>
      <ThemedText type="small" style={styles.texto}>
        {texto}
      </ThemedText>
    </View>
  );
}

export function AvisoDeRed() {
  const red = useNetworkState();

  // isConnected no alcanza: puede haber Wi-Fi sin que pase ningún dato.
  if (red.isInternetReachable === false) {
    return <Barra texto="Sin conexión. Algunas funciones pueden no estar disponibles." color="#B45309" />;
  }

  if (red.type === NetworkStateType.CELLULAR) {
    return <Barra texto="Estás usando datos móviles." color="#0369A1" />;
  }

  return null;
}

const styles = StyleSheet.create({
  barra: { paddingHorizontal: 16, paddingVertical: 8 },
  texto: { color: '#ffffff', fontWeight: '700', textAlign: 'center' },
});