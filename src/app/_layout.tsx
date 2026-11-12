import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AppState, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SesionProvider } from '@/contexto/sesion';

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
      <SesionProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="escanear" options={{ title: 'Escanear QR' }} />
            <Stack.Screen name="lugar/[id]" options={{ title: 'Lugar' }} />
            <Stack.Screen name="favoritos" options={{ title: 'Mis favoritos' }} />
          </Stack>
        </ThemeProvider>
      </SesionProvider>
    </QueryClientProvider>
  );
}