import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSesion } from '@/contexto/sesion';
import { useLugares } from '@/hooks/use-lugares';
import { useRegistrarVisita } from '@/hooks/use-visitas';
import { ErrorDeApi } from '@/servicios/cliente';
import { confirmacionHaptica } from '@/utils/haptica';

type Resultado =
  | { tipo: 'buscando' }
  | { tipo: 'ajeno' } // no es un código de Mi Ciudad Colón
  | { tipo: 'desconocido' } // tiene el formato, pero no hay ningún lugar con ese código
  | { tipo: 'repetida'; lugarId: string; nombre: string }
  | { tipo: 'registrada'; visitaId: string; nombre: string }
  | { tipo: 'error'; mensaje: string };

function Mensaje({ titulo, texto, children }: { titulo: string; texto: string; children?: ReactNode }) {
  return (
    <ThemedView style={styles.centro}>
      <ThemedText type="subtitle" style={styles.texto}>
        {titulo}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.texto}>
        {texto}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

function Boton({ texto, alTocar, secundario }: { texto: string; alTocar: () => void; secundario?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={alTocar}
      style={[styles.boton, secundario && styles.botonSecundario]}>
      <ThemedText style={secundario ? styles.textoSecundario : styles.textoBoton}>{texto}</ThemedText>
    </Pressable>
  );
}

function volver() {
  if (router.canGoBack()) router.back();
  else router.replace('/recorrido');
}

export default function Escanear() {
  const { estado } = useSesion();
  const lugares = useLugares();
  const registrar = useRegistrarVisita();
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [resultado, setResultado] = useState<Resultado>({ tipo: 'buscando' });
  // Se actualiza al instante: evita procesar el mismo QR decenas de veces por segundo.
  const ocupado = useRef(false);

  function escanearOtro() {
    ocupado.current = false;
    setResultado({ tipo: 'buscando' });
  }

  function alEscanear({ data }: { data: string }) {
    if (ocupado.current || !lugares.data) return;
    ocupado.current = true;

    const codigo = data.trim();
    if (!codigo.startsWith('COLON:')) {
      setResultado({ tipo: 'ajeno' });
      return;
    }
    const lugar = lugares.data.find((l) => l.codigoQr === codigo);
    if (!lugar) {
      setResultado({ tipo: 'desconocido' });
      return;
    }

    registrar.mutate(
      { lugarId: lugar.id, origen: 'qr' },
      {
        onSuccess: (visita) => {
          confirmacionHaptica();
          setResultado({ tipo: 'registrada', visitaId: visita.id, nombre: lugar.nombre });
        },
        onError: (error) => {
          if (error instanceof ErrorDeApi && error.codigo === 'VISITA_DUPLICADA') {
            setResultado({ tipo: 'repetida', lugarId: lugar.id, nombre: lugar.nombre });
          } else {
            setResultado({ tipo: 'error', mensaje: error.message });
          }
        },
      },
    );
  }

  if (estado.fase !== 'con-sesion') {
    return (
      <Mensaje
        titulo="Ingresá a tu cuenta"
        texto="Para guardar las visitas de tu recorrido necesitás una cuenta.">
        <Boton texto="Ir a mi cuenta" alTocar={() => router.push('/yo')} />
      </Mensaje>
    );
  }

  if (!permiso) {
    return (
      <ThemedView style={styles.centro}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!permiso.granted) {
    return (
      <Mensaje
        titulo="Necesitamos la cámara"
        texto="Se usa solo para leer el código QR de los carteles. También podés marcar la visita a mano desde cada lugar.">
        {permiso.canAskAgain ? (
          <Boton texto="Permitir la cámara" alTocar={() => pedirPermiso()} />
        ) : (
          <Boton texto="Abrir ajustes" alTocar={() => Linking.openSettings()} />
        )}
        <Boton texto="Volver" alTocar={volver} secundario />
      </Mensaje>
    );
  }

  if (lugares.isPending) {
    return (
      <ThemedView style={styles.centro}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (lugares.isError) {
    return (
      <Mensaje titulo="Ups" texto="No pudimos cargar los lugares para reconocer el código.">
        <Boton texto="Reintentar" alTocar={() => lugares.refetch()} />
      </Mensaje>
    );
  }

  switch (resultado.tipo) {
    case 'ajeno':
      return (
        <Mensaje
          titulo="Este código no es de Mi Ciudad Colón"
          texto="Buscá el código QR de los carteles de la peatonal.">
          <Boton texto="Escanear otro" alTocar={escanearOtro} />
        </Mensaje>
      );
    case 'desconocido':
      return (
        <Mensaje
          titulo="No reconocemos este código"
          texto="Parece de Mi Ciudad Colón, pero no corresponde a ningún lugar. Puede estar dañado.">
          <Boton texto="Escanear otro" alTocar={escanearOtro} />
        </Mensaje>
      );
    case 'repetida':
      return (
        <Mensaje
          titulo={`Ya registraste ${resultado.nombre} hoy`}
          texto="Desde el lugar podés editar esa visita.">
          <Boton texto="Ver el lugar" alTocar={() => router.replace(`/lugar/${resultado.lugarId}`)} />
          <Boton texto="Escanear otro" alTocar={escanearOtro} secundario />
        </Mensaje>
      );
    case 'registrada':
      return (
        <Mensaje titulo="¡Visita registrada!" texto={resultado.nombre}>
          <Boton
            texto="Agregar foto y nota"
            alTocar={() => router.replace(`/visita/${resultado.visitaId}`)}
          />
          <Boton texto="Escanear otro" alTocar={escanearOtro} secundario />
          <Boton texto="Listo" alTocar={volver} secundario />
        </Mensaje>
      );
    case 'error':
      return (
        <Mensaje titulo="No pudimos registrar la visita" texto={resultado.mensaje}>
          <Boton texto="Reintentar" alTocar={escanearOtro} />
        </Mensaje>
      );
    default:
      break;
  }

  return (
    <View style={styles.pantalla}>
      <CameraView
        style={styles.camara}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={alEscanear}
      />
      <View style={styles.guia} pointerEvents="none" />
      <View style={styles.cartel} pointerEvents="none">
        <ThemedText style={styles.textoCartel}>
          {registrar.isPending ? 'Registrando…' : 'Apuntá la cámara al código QR del cartel'}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#000000' },
  camara: { flex: 1 },
  guia: {
    position: 'absolute',
    top: '25%',
    alignSelf: 'center',
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 16,
  },
  cartel: { position: 'absolute', bottom: 48, left: 24, right: 24, alignItems: 'center' },
  textoCartel: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  texto: { textAlign: 'center' },
  boton: {
    backgroundColor: '#208AEF',
    paddingHorizontal: 24,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
  },
  botonSecundario: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#208AEF' },
  textoBoton: { color: '#ffffff', fontWeight: '700' },
  textoSecundario: { color: '#208AEF', fontWeight: '700' },
});