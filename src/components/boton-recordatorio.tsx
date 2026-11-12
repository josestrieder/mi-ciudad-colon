import Ionicons from '@react-native-vector-icons/ionicons';
import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useSesion } from '@/contexto/sesion';
import { useAlternarRecordatorio, useRecordatorios } from '@/hooks/use-recordatorios';
import { MINUTOS_ANTES } from '@/servicios/recordatorios';
import type { Evento } from '@/tipos';

export function BotonRecordatorio({ evento }: { evento: Evento }) {
  const { estado } = useSesion();
  const { data: recordatorios } = useRecordatorios();
  const alternar = useAlternarRecordatorio();

  // Un evento suspendido o cancelado no se puede recordar.
  if (evento.estado !== 'programado') return null;

  const activo = Boolean(recordatorios?.[evento.id]);
  const resultado = alternar.data;

  function alTocar() {
    if (estado.fase !== 'con-sesion') {
      router.push('/yo'); // la cuenta es para guardar cosas
      return;
    }
    alternar.mutate({ evento, activo });
  }

  return (
    <View style={styles.contenedor}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={activo ? 'Quitar el aviso de este evento' : 'Avisarme antes de este evento'}
        onPress={alTocar}
        disabled={alternar.isPending}
        style={[styles.boton, activo && styles.botonActivo, alternar.isPending && styles.inactivo]}>
        <Ionicons
          name={activo ? 'notifications' : 'notifications-outline'}
          size={20}
          color={activo ? '#ffffff' : '#208AEF'}
        />
        <ThemedText style={activo ? styles.textoActivo : styles.texto}>
          {activo ? 'Aviso activado' : 'Avisarme'}
        </ThemedText>
      </Pressable>

      {activo && resultado?.tipo === 'activado' ? (
        <ThemedText type="small" themeColor="textSecondary">
          {resultado.inmediato
            ? 'El evento empieza pronto: te avisamos en unos segundos.'
            : `Te avisamos ${MINUTOS_ANTES} minutos antes.`}
        </ThemedText>
      ) : null}

      {resultado?.tipo === 'sin-permiso' ? (
        <ThemedText type="small" style={styles.error}>
          Sin el permiso de avisos no podemos recordarte el evento.
        </ThemedText>
      ) : null}

      {resultado?.tipo === 'bloqueado' ? (
        <View style={styles.contenedor}>
          <ThemedText type="small" style={styles.error}>
            Los avisos están bloqueados. Activalos desde los Ajustes del teléfono.
          </ThemedText>
          <Pressable accessibilityRole="button" onPress={() => Linking.openSettings()}>
            <ThemedText type="linkPrimary">Abrir ajustes</ThemedText>
          </Pressable>
        </View>
      ) : null}

      {resultado?.tipo === 'ya-empezo' ? (
        <ThemedText type="small" style={styles.error}>
          Este evento ya empezó.
        </ThemedText>
      ) : null}

      {alternar.isError ? (
        <ThemedText type="small" style={styles.error}>
          {alternar.error.message}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 6, alignItems: 'flex-start' },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#208AEF',
  },
  botonActivo: { backgroundColor: '#208AEF' },
  inactivo: { opacity: 0.6 },
  texto: { color: '#208AEF', fontWeight: '700' },
  textoActivo: { color: '#ffffff', fontWeight: '700' },
  error: { color: '#B91C1C', fontWeight: '700' },
});