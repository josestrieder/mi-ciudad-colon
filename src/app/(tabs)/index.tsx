import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AvisoUbicacion } from '@/components/aviso-ubicacion';
import { FiltrosLugares } from '@/components/filtros-lugares';
import { MapaLugares } from '@/components/mapa-lugares';
import { TarjetaLugar } from '@/components/tarjeta-lugar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCategorias } from '@/hooks/use-categorias';
import { useLugares } from '@/hooks/use-lugares';
import { useUbicacion } from '@/hooks/use-ubicacion';
import { normalizar } from '@/servicios/cliente';
import { distanciaMetros } from '@/utils/distancia';

export default function Mapa() {
  const { data: lugares, isPending, isError, error, refetch } = useLugares();
  const { permiso, pedirPermiso, coordenadas } = useUbicacion();
  const { data: categorias } = useCategorias();
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState<string | null>(null);

  if (isPending) {
    return (
      <ThemedView style={styles.centro}>
        <ActivityIndicator size="large" />
        <ThemedText themeColor="textSecondary">Cargando lugares…</ThemedText>
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.centro}>
        <ThemedText type="subtitle">Ups</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.texto}>
          {error.message}
        </ThemedText>
        <Pressable accessibilityRole="button" onPress={() => refetch()} style={styles.boton}>
          <ThemedText style={styles.textoBoton}>Reintentar</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (lugares.length === 0) {
    return (
      <ThemedView style={styles.centro}>
        <ThemedText type="subtitle">Sin lugares</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.texto}>
          Todavía no hay lugares para mostrar.
        </ThemedText>
      </ThemedView>
    );
  }

  // Se filtra en el teléfono: el catálogo ya está completo y guardado, y así funciona sin conexión.
  const buscado = normalizar(busqueda);
  const hayFiltro = buscado !== '' || categoriaId !== null;
  const filtrados = lugares.filter(
    (lugar) =>
      (categoriaId === null || lugar.categoriaId === categoriaId) &&
      (buscado === '' ||
        normalizar(`${lugar.nombre} ${lugar.descripcionCorta} ${lugar.direccion}`).includes(buscado)),
  );

  const items = filtrados.map((lugar) => ({
    lugar,
    distancia: coordenadas ? distanciaMetros(coordenadas, lugar.coordenadas) : null,
  }));
  if (coordenadas) items.sort((a, b) => (a.distancia ?? 0) - (b.distancia ?? 0));

  function limpiarFiltros() {
    setBusqueda('');
    setCategoriaId(null);
  }

  return (
    <ThemedView style={styles.pantalla}>
      <MapaLugares lugares={filtrados} usuario={coordenadas} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.lugar.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TarjetaLugar lugar={item.lugar} distanciaMetros={item.distancia} />
        )}
        ListHeaderComponent={
          <View style={styles.encabezado}>
            <AvisoUbicacion permiso={permiso} onPedir={pedirPermiso} />
            <FiltrosLugares
              busqueda={busqueda}
              onBusqueda={setBusqueda}
              categorias={categorias ?? []}
              categoriaId={categoriaId}
              onCategoria={setCategoriaId}
            />
            {hayFiltro ? (
              <ThemedText type="small" themeColor="textSecondary">
                {filtrados.length} de {lugares.length} lugares
              </ThemedText>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.vacio}>
            <ThemedText type="subtitle">Sin resultados</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.texto}>
              No encontramos lugares con ese filtro.
            </ThemedText>
            <Pressable accessibilityRole="button" onPress={limpiarFiltros} style={styles.boton}>
              <ThemedText style={styles.textoBoton}>Limpiar filtros</ThemedText>
            </Pressable>
          </View>
        }
        contentContainerStyle={styles.lista}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  vacio: { alignItems: 'center', padding: 24, gap: 12 },
  texto: { textAlign: 'center' },
  lista: { padding: 16, gap: 12 },
  encabezado: { gap: 12 },
  boton: {
    backgroundColor: '#208AEF',
    paddingHorizontal: 24,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
  },
  textoBoton: { color: '#ffffff', fontWeight: '700' },
});