import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { FormularioCuenta } from '@/components/formulario-cuenta';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSesion } from '@/contexto/sesion';

export default function Yo() {
  const { estado, cerrarSesion } = useSesion();

  if (estado.fase === 'cargando') {
    return (
      <ThemedView style={styles.centro}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (estado.fase === 'sin-sesion') {
    return <FormularioCuenta />;
  }

  return (
    <ThemedView style={styles.centro}>
      <ThemedText type="subtitle">{estado.usuario.nombre}</ThemedText>
      <ThemedText themeColor="textSecondary">{estado.usuario.email}</ThemedText>
      <Pressable accessibilityRole="button" onPress={cerrarSesion} style={styles.boton}>
        <ThemedText style={styles.textoBoton}>Cerrar sesión</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  boton: {
    backgroundColor: '#208AEF',
    paddingHorizontal: 24,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
  },
  textoBoton: { color: '#ffffff', fontWeight: '700' },
});