import { usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useEstadoCatalogo } from '@/hooks/use-lugares';
import { claveDia, horaDe, tituloDia } from '@/utils/fechas';

export function AvisoDatosGuardados() {
  const ruta = usePathname();
  const estado = useEstadoCatalogo();

  if (ruta !== '/' || !estado.data?.desdeCache) return null; // sólo en la pestaña Mapa

  const cuando = estado.data.sincronizadoEn;
  const fecha = cuando ? ` Guardados el ${tituloDia(claveDia(cuando))}, ${horaDe(cuando)} hs.` : '';

  return (
    <View accessibilityRole="alert" style={styles.barra}>
      <ThemedText type="small" style={styles.texto}>
        Mostrando datos guardados.{fecha}
      </ThemedText>
      <Pressable accessibilityRole="button" onPress={() => estado.refetch()}>
        <ThemedText type="small" style={styles.reintentar}>
          Reintentar
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
    alignItems: 'center',
  },
  texto: { color: '#ffffff', textAlign: 'center' },
  reintentar: { color: '#ffffff', fontWeight: '700', textDecorationLine: 'underline' },
});