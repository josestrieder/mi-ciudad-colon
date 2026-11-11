import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useSesion } from '@/contexto/sesion';
import { useRegistrarVisita } from '@/hooks/use-visitas';
import { confirmacionHaptica } from '@/utils/haptica';

export function BotonVisita({ lugarId }: { lugarId: string }) {
  const { estado } = useSesion();
  const registrar = useRegistrarVisita();

  function alTocar() {
    if (estado.fase !== 'con-sesion') {
      router.push('/yo'); // la cuenta es para guardar cosas
      return;
    }
    registrar.mutate(lugarId, { onSuccess: () => confirmacionHaptica() });
  }

  return (
    <View style={styles.contenedor}>
      <Pressable
        accessibilityRole="button"
        onPress={alTocar}
        disabled={registrar.isPending}
        style={[styles.boton, registrar.isPending && styles.inactivo]}>
        <ThemedText style={styles.textoBoton}>Marcar como visitado</ThemedText>
      </Pressable>
      {registrar.isSuccess ? (
        <ThemedText type="small" themeColor="textSecondary">
          Visita guardada en Mi recorrido.
        </ThemedText>
      ) : null}
      {registrar.isError ? (
        <ThemedText type="small" style={styles.error}>
          {registrar.error.message}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 8, alignItems: 'flex-start' },
  boton: {
    backgroundColor: '#208AEF',
    paddingHorizontal: 24,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
  },
  inactivo: { opacity: 0.6 },
  textoBoton: { color: '#ffffff', fontWeight: '700' },
  error: { color: '#B91C1C', fontWeight: '700' },
});