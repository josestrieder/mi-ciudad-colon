import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type Props = { titulo: string; descripcion: string };

export function PantallaProvisoria({ titulo, descripcion }: Props) {
  return (
    <ThemedView style={styles.contenedor}>
      <ThemedText type="subtitle">{titulo}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.descripcion}>
        {descripcion}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  descripcion: { textAlign: 'center' },
});