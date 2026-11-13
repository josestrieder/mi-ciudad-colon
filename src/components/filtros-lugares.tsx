import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { Categoria } from '@/tipos';

type Props = {
  busqueda: string;
  onBusqueda: (texto: string) => void;
  categorias: Categoria[];
  categoriaId: string | null;
  onCategoria: (id: string | null) => void;
};

function Boton({ texto, activo, alTocar }: { texto: string; activo: boolean; alTocar: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={alTocar}
      style={[styles.boton, activo && styles.botonActivo]}>
      <ThemedText style={activo ? styles.textoActivo : styles.texto}>{texto}</ThemedText>
    </Pressable>
  );
}

export function FiltrosLugares({ busqueda, onBusqueda, categorias, categoriaId, onCategoria }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.contenedor}>
      <TextInput
        accessibilityLabel="Buscar lugares"
        placeholder="Buscar un lugar"
        placeholderTextColor={theme.textSecondary}
        value={busqueda}
        onChangeText={onBusqueda}
        autoCorrect={false}
        returnKeyType="search"
        style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
      />
      {categorias.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.botones}>
          <Boton texto="Todas" activo={categoriaId === null} alTocar={() => onCategoria(null)} />
          {categorias.map((categoria) => (
            <Boton
              key={categoria.id}
              texto={categoria.nombre}
              activo={categoriaId === categoria.id}
              alTocar={() => onCategoria(categoria.id)}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 12 },
  input: { borderRadius: 12, paddingHorizontal: 16, minHeight: 48, fontSize: 16 },
  botones: { gap: 8, paddingRight: 8 },
  boton: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#208AEF',
    justifyContent: 'center',
  },
  botonActivo: { backgroundColor: '#208AEF' },
  texto: { color: '#208AEF', fontWeight: '700' },
  textoActivo: { color: '#ffffff', fontWeight: '700' },
});