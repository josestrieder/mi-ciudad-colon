import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useSesion } from '@/contexto/sesion';
import { useTheme } from '@/hooks/use-theme';

type Modo = 'ingresar' | 'registrar';

export function FormularioCuenta() {
  const { ingresar, registrar } = useSesion();
  const theme = useTheme();

  const [modo, setModo] = useState<Modo>('ingresar');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const esRegistro = modo === 'registrar';
  const estiloInput = [styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }];

  function validar(): string | null {
    if (esRegistro && nombre.trim().length === 0) return 'Escribí tu nombre.';
    if (!email.includes('@')) return 'Escribí un email válido.';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    return null;
  }

  async function enviar() {
    const mensaje = validar();
    if (mensaje) {
      setError(mensaje);
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      if (esRegistro) {
        await registrar({ nombre, email, password });
      } else {
        await ingresar(email, password);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error inesperado.');
    } finally {
      setEnviando(false);
    }
  }

  function cambiarModo() {
    setModo(esRegistro ? 'ingresar' : 'registrar');
    setError(null);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <ThemedText type="subtitle">{esRegistro ? 'Crear cuenta' : 'Ingresar'}</ThemedText>
        <ThemedText themeColor="textSecondary">
          Con tu cuenta guardás tus favoritos y tu recorrido por Colón. Para mirar el mapa y los
          lugares no la necesitás.
        </ThemedText>

        {esRegistro ? (
          <TextInput
            accessibilityLabel="Nombre"
            placeholder="Nombre"
            placeholderTextColor={theme.textSecondary}
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
            style={estiloInput}
          />
        ) : null}

        <TextInput
          accessibilityLabel="Email"
          placeholder="Email"
          placeholderTextColor={theme.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={estiloInput}
        />

        <TextInput
          accessibilityLabel="Contraseña"
          placeholder="Contraseña"
          placeholderTextColor={theme.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          style={estiloInput}
        />

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

        <Pressable
          accessibilityRole="button"
          onPress={enviar}
          disabled={enviando}
          style={[styles.boton, enviando && styles.botonInactivo]}>
          {enviando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText style={styles.textoBoton}>
              {esRegistro ? 'Crear cuenta' : 'Ingresar'}
            </ThemedText>
          )}
        </Pressable>

        <Pressable accessibilityRole="button" onPress={cambiarModo}>
          <ThemedText type="linkPrimary">
            {esRegistro ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  contenido: { padding: 24, gap: 12 },
  input: { borderRadius: 12, paddingHorizontal: 16, minHeight: 48, fontSize: 16 },
  error: { color: '#B91C1C', fontWeight: '700' },
  boton: {
    backgroundColor: '#208AEF',
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonInactivo: { opacity: 0.6 },
  textoBoton: { color: '#ffffff', fontWeight: '700' },
});