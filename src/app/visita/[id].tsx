import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLugares } from '@/hooks/use-lugares';
import { useTheme } from '@/hooks/use-theme';
import { useActualizarVisita, useVisitas } from '@/hooks/use-visitas';
import type { CambiosVisita } from '@/servicios/visitas';
import { claveDia, horaDe, tituloDia } from '@/utils/fechas';
import { borrarFoto, guardarFoto } from '@/utils/fotos';

const MAX_NOTA = 200;

export default function DetalleVisita() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const visitas = useVisitas();
  const lugares = useLugares();
  const actualizar = useActualizarVisita();
  const theme = useTheme();
  const [permisoCamara, pedirPermisoCamara] = ImagePicker.useCameraPermissions();
  const [notaEscrita, setNotaEscrita] = useState<string | null>(null); // null = no la tocó todavía
  const [fotoNueva, setFotoNueva] = useState<string | null>(null); // borrador: todavía en la caché
  const [aviso, setAviso] = useState<string | null>(null);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  if (visitas.isPending || lugares.isPending) {
    return (
      <ThemedView style={styles.centro}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (visitas.isError || lugares.isError) {
    return (
      <ThemedView style={styles.centro}>
        <ThemedText type="subtitle">Ups</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.texto}>
          No pudimos cargar la visita.
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            visitas.refetch();
            lugares.refetch();
          }}
          style={styles.boton}>
          <ThemedText style={styles.textoBoton}>Reintentar</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const visita = visitas.data.find((v) => v.id === id);

  if (!visita) {
    return (
      <ThemedView style={styles.centro}>
        <ThemedText type="subtitle">No encontramos esta visita</ThemedText>
      </ThemedView>
    );
  }

  const nombreLugar = lugares.data.find((l) => l.id === visita.lugarId)?.nombre ?? 'Lugar';
  const nota = notaEscrita ?? visita.nota ?? '';
  const fotoMostrada = fotoNueva ?? visita.fotoUri;
  const hayCambios =
    fotoNueva !== null || (notaEscrita !== null && (notaEscrita.trim() || null) !== visita.nota);
  const permisoBloqueado = permisoCamara && !permisoCamara.granted && !permisoCamara.canAskAgain;

  async function sacarFoto() {
    setAviso(null);
    setErrorGuardar(null);
    if (!permisoCamara?.granted) {
      const respuesta = await pedirPermisoCamara();
      if (!respuesta.granted) {
        setAviso(
          respuesta.canAskAgain
            ? 'Necesitamos el permiso de cámara para sacar la foto. Podés elegir una de la galería.'
            : 'El permiso de cámara está bloqueado. Activalo desde los Ajustes o elegí una foto de la galería.',
        );
        return;
      }
    }
    const resultado = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (resultado.canceled) return;
    setFotoNueva(resultado.assets[0].uri); // borrador: recién se copia a documentos al guardar
  }

  async function elegirDeGaleria() {
    setAviso(null);
    setErrorGuardar(null);
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (resultado.canceled) return;
    setFotoNueva(resultado.assets[0].uri);
  }

  function volver() {
    if (router.canGoBack()) router.back();
    else router.replace('/recorrido'); // por si la pantalla se abrió sin historial
  }

  function descartar() {
    if (!hayCambios) {
      volver();
      return;
    }
    Alert.alert('¿Salir sin guardar?', 'Se van a perder los cambios que hiciste.', [
      { text: 'Seguir editando', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: volver },
    ]);
  }

  function guardar() {
    if (!visita) return;
    if (!hayCambios) {
      setErrorGuardar('No hay cambios para guardar. Escribí una nota o agregá una foto.');
      return;
    }
    setErrorGuardar(null);
    const cambios: CambiosVisita = {};
    if (fotoNueva) cambios.fotoUri = guardarFoto(fotoNueva); // ahora sí: caché → documentos
    if (notaEscrita !== null) cambios.nota = notaEscrita.trim() || null;

    const fotoAnterior = visita.fotoUri;
    actualizar.mutate(
      { visitaId: visita.id, cambios },
      {
        onSuccess: () => {
          if (cambios.fotoUri && fotoAnterior) borrarFoto(fotoAnterior);
          volver();
        },
        onError: () => {
          // Si falló, no dejamos la copia suelta: el borrador sigue y se puede reintentar.
          if (cambios.fotoUri) borrarFoto(cambios.fotoUri);
        },
      },
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Stack.Screen options={{ title: nombreLugar }} />

        <ThemedText type="subtitle">{nombreLugar}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {tituloDia(claveDia(visita.fechaHora))} · {horaDe(visita.fechaHora)} hs
        </ThemedText>
        <Pressable accessibilityRole="button" onPress={() => router.push(`/lugar/${visita.lugarId}`)}>
          <ThemedText type="linkPrimary">Ver el lugar</ThemedText>
        </Pressable>

        {fotoMostrada ? (
          <Image
            source={{ uri: fotoMostrada }}
            style={styles.foto}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <ThemedText themeColor="textSecondary">Todavía no hay foto de esta visita.</ThemedText>
        )}
        {fotoNueva ? (
          <ThemedText type="small" themeColor="textSecondary">
            Foto nueva sin guardar
          </ThemedText>
        ) : null}

        <View style={styles.fila}>
          <Pressable accessibilityRole="button" onPress={sacarFoto} style={styles.boton}>
            <ThemedText style={styles.textoBoton}>Sacar foto</ThemedText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={elegirDeGaleria} style={styles.boton}>
            <ThemedText style={styles.textoBoton}>Elegir de la galería</ThemedText>
          </Pressable>
        </View>

        {aviso ? <ThemedText style={styles.error}>{aviso}</ThemedText> : null}
        {permisoBloqueado ? (
          <Pressable accessibilityRole="button" onPress={() => Linking.openSettings()}>
            <ThemedText type="linkPrimary">Abrir ajustes</ThemedText>
          </Pressable>
        ) : null}

        <ThemedText style={styles.etiqueta}>Nota</ThemedText>
        <TextInput
          accessibilityLabel="Nota de la visita"
          placeholder="Escribí una nota corta"
          placeholderTextColor={theme.textSecondary}
          value={nota}
          onChangeText={(texto) => {
            setNotaEscrita(texto);
            setErrorGuardar(null);
          }}
          maxLength={MAX_NOTA}
          multiline
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
        />
        <ThemedText type="small" themeColor="textSecondary">
          {nota.length}/{MAX_NOTA}
        </ThemedText>

        {actualizar.isError ? (
          <ThemedText style={styles.error}>{actualizar.error.message}</ThemedText>
        ) : null}
        {errorGuardar ? <ThemedText style={styles.error}>{errorGuardar}</ThemedText> : null}

        <View style={styles.fila}>
          <Pressable
            accessibilityRole="button"
            onPress={descartar}
            style={[styles.boton, styles.botonSecundario]}>
            <ThemedText style={styles.textoSecundario}>Volver</ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={guardar}
            disabled={actualizar.isPending}
            style={[styles.boton, actualizar.isPending && styles.inactivo]}>
            <ThemedText style={styles.textoBoton}>Guardar</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  texto: { textAlign: 'center' },
  contenido: { padding: 16, gap: 12 },
  foto: { width: '100%', aspectRatio: 4 / 3, borderRadius: 12 },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  etiqueta: { fontWeight: '700' },
  input: {
    borderRadius: 12,
    padding: 16,
    minHeight: 96,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  boton: {
    backgroundColor: '#208AEF',
    paddingHorizontal: 20,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
  },
  botonSecundario: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#208AEF' },
  inactivo: { opacity: 0.5 },
  textoBoton: { color: '#ffffff', fontWeight: '700' },
  textoSecundario: { color: '#208AEF', fontWeight: '700' },
  error: { color: '#B91C1C', fontWeight: '700' },
});