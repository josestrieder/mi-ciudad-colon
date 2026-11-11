import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, View } from 'react-native';

import { FormularioCuenta } from '@/components/formulario-cuenta';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSesion } from '@/contexto/sesion';
import { biometriaDisponible } from '@/servicios/biometria';

export default function Yo() {
  const { estado, usaBiometria, cerrarSesion, desbloquear, activarBiometria, desactivarBiometria } =
    useSesion();
  const [hayBiometria, setHayBiometria] = useState<boolean | null>(null);

  useEffect(() => {
    biometriaDisponible()
      .then(setHayBiometria)
      .catch(() => setHayBiometria(false));
  }, []);

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

  if (estado.fase === 'bloqueada') {
    return (
      <ThemedView style={styles.centro}>
        <ThemedText type="subtitle">Sesión bloqueada</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.texto}>
          Usá tu huella o tu rostro para volver a entrar.
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            desbloquear();
          }}
          style={styles.boton}>
          <ThemedText style={styles.textoBoton}>Desbloquear</ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            cerrarSesion();
          }}>
          <ThemedText type="linkPrimary">Usar mi contraseña</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.centro}>
      <ThemedText type="subtitle">{estado.usuario.nombre}</ThemedText>
      <ThemedText themeColor="textSecondary">{estado.usuario.email}</ThemedText>

      {hayBiometria === true ? (
        <View style={styles.fila}>
          <ThemedText>Entrar con huella o rostro</ThemedText>
          <Switch
            accessibilityLabel="Entrar con huella o rostro"
            value={usaBiometria}
            onValueChange={(activar) => {
              if (activar) activarBiometria();
              else desactivarBiometria();
            }}
          />
        </View>
      ) : null}

      {hayBiometria === false ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.texto}>
          Este teléfono no tiene huella o rostro registrados. Vas a entrar con tu contraseña.
        </ThemedText>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          cerrarSesion();
        }}
        style={styles.boton}>
        <ThemedText style={styles.textoBoton}>Cerrar sesión</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  texto: { textAlign: 'center' },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  boton: {
    backgroundColor: '#208AEF',
    paddingHorizontal: 24,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
  },
  textoBoton: { color: '#ffffff', fontWeight: '700' },
});