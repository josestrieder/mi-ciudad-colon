import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useSesion } from '@/contexto/sesion';
import { useEliminarVisita, useRegistrarVisita, useVisitas } from '@/hooks/use-visitas';
import { usarApiReal } from '@/servicios/api';
import { ahoraEnColon, claveDia } from '@/utils/fechas';
import { borrarFoto } from '@/utils/fotos';
import { confirmacionHaptica } from '@/utils/haptica';

export function BotonVisita({ lugarId }: { lugarId: string }) {
  const { estado } = useSesion();
  const { data: visitas } = useVisitas();
  const registrar = useRegistrarVisita();
  const eliminar = useEliminarVisita();

  // Una visita por lugar y por día: si ya hay una de hoy, se edita o se quita.
  const hoy = claveDia(ahoraEnColon());
  const visitaDeHoy = visitas?.find((v) => v.lugarId === lugarId && claveDia(v.fechaHora) === hoy);

  if (visitaDeHoy) {
    const pendiente = !visitaDeHoy.sincronizada;
    const tieneFotoONota = Boolean(visitaDeHoy.fotoUri || visitaDeHoy.nota);
    // La API no permite borrar visitas: solo se pueden quitar las que todavía están en el teléfono.
    const puedeQuitar = pendiente || !usarApiReal;

    function confirmarQuitar() {
      if (!visitaDeHoy) return;
      Alert.alert(
        '¿Quitar esta visita?',
        pendiente
          ? 'Se borra del teléfono y no se va a subir.'
          : tieneFotoONota
            ? 'Se van a borrar también la foto y la nota.'
            : 'Podés volver a marcarla cuando quieras.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Quitar',
            style: 'destructive',
            onPress: () =>
              eliminar.mutate(visitaDeHoy.id, {
                onSuccess: () => {
                  if (visitaDeHoy.fotoUri) borrarFoto(visitaDeHoy.fotoUri);
                },
              }),
          },
        ],
      );
    }

    return (
      <View style={styles.contenedor}>
        <ThemedText type="small" themeColor="textSecondary">
          {pendiente
            ? 'Visita guardada en el teléfono. Se sube cuando haya conexión.'
            : 'Ya registraste este lugar hoy.'}
        </ThemedText>
        <View style={styles.fila}>
          {!pendiente ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/visita/${visitaDeHoy.id}`)}
              style={styles.boton}>
              <ThemedText style={styles.textoBoton}>
                {tieneFotoONota ? 'Editar visita' : 'Agregar foto y nota'}
              </ThemedText>
            </Pressable>
          ) : null}
          {puedeQuitar ? (
            <Pressable
              accessibilityRole="button"
              onPress={confirmarQuitar}
              disabled={eliminar.isPending}
              style={[styles.boton, styles.botonSecundario, eliminar.isPending && styles.inactivo]}>
              <ThemedText style={styles.textoSecundario}>Quitar visita</ThemedText>
            </Pressable>
          ) : null}
        </View>
        {eliminar.isError ? (
          <ThemedText type="small" style={styles.error}>
            {eliminar.error.message}
          </ThemedText>
        ) : null}
      </View>
    );
  }

  function alTocar() {
    if (estado.fase !== 'con-sesion') {
      router.push('/yo'); // la cuenta es para guardar cosas
      return;
    }
    registrar.mutate({ lugarId, origen: 'manual' }, { onSuccess: () => confirmacionHaptica() });
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
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  boton: {
    backgroundColor: '#208AEF',
    paddingHorizontal: 24,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
  },
  botonSecundario: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#208AEF' },
  inactivo: { opacity: 0.6 },
  textoBoton: { color: '#ffffff', fontWeight: '700' },
  textoSecundario: { color: '#208AEF', fontWeight: '700' },
  error: { color: '#B91C1C', fontWeight: '700' },
});