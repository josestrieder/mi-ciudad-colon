import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { useSesion } from '@/contexto/sesion';
import { useAlternarFavorito, useFavoritos } from '@/hooks/use-favoritos';
import { confirmacionHaptica } from '@/utils/haptica';

export function BotonFavorito({ lugarId }: { lugarId: string }) {
  const { estado } = useSesion();
  const { data: favoritos } = useFavoritos();
  const alternar = useAlternarFavorito();

  const esFavorito = favoritos?.some((f) => f.lugarId === lugarId) ?? false;

  function alTocar() {
    if (estado.fase !== 'con-sesion') {
      router.push('/yo'); // la cuenta es para guardar cosas
      return;
    }
    confirmacionHaptica();
    alternar.mutate({ lugarId, esFavorito });
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      onPress={alTocar}
      style={styles.boton}>
      <Ionicons
        name={esFavorito ? 'heart' : 'heart-outline'}
        size={28}
        color={esFavorito ? '#E0245E' : '#6B7280'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});