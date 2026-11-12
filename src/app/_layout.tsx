import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { AppState, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Sincronizador } from '@/components/sincronizador';
import { SesionProvider } from '@/contexto/sesion';
import { migrar, NOMBRE_BD } from '@/servicios/base-de-datos';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 2 } },
});

// En React Native no hay «foco de ventana»: se lo damos nosotros.
AppState.addEventListener('change', (estado) =>
  focusManager.setFocused(estado === 'active'),
);

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <SQLiteProvider databaseName={NOMBRE_BD} onInit={migrar}>
        <SesionProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AnimatedSplashOverlay />
            <Sincronizador />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="lugar/[id]" options={{ title: 'Lugar' }} />
              <Stack.Screen name="favoritos" options={{ title: 'Mis favoritos' }} />
              <Stack.Screen name="visita/[id]" options={{ title: 'Visita' }} />
              <Stack.Screen name="escanear" options={{ title: 'Escanear QR' }} />
            </Stack>
          </ThemeProvider>
        </SesionProvider>
      </SQLiteProvider>
    </QueryClientProvider>
  );
}