import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const CANAL_EVENTOS = 'eventos';

// Se declara UNA vez, al cargar el módulo: qué pasa si el aviso llega con la app abierta.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type PermisoAvisos = 'concedido' | 'denegado' | 'bloqueado';

export async function pedirPermisoAvisos(): Promise<PermisoAvisos> {
  if (Platform.OS === 'android') {
    // En Android el canal va ANTES del permiso.
    await Notifications.setNotificationChannelAsync(CANAL_EVENTOS, {
      name: 'Recordatorios de eventos',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const actual = await Notifications.getPermissionsAsync();
  if (actual.status === 'granted') return 'concedido';
  if (!actual.canAskAgain) return 'bloqueado';

  const pedido = await Notifications.requestPermissionsAsync();
  if (pedido.status === 'granted') return 'concedido';
  return pedido.canAskAgain ? 'denegado' : 'bloqueado';
}