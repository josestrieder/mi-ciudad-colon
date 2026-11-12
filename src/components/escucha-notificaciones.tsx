import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';

import '@/servicios/notificaciones'; // declara el handler una sola vez, al cargar la app

export function EscuchaNotificaciones() {
  useEffect(() => {
    // El usuario tocó el aviso: la app puede estar abierta o minimizada.
    const tocada = Notifications.addNotificationResponseReceivedListener((respuesta) => {
      const { ruta } = respuesta.notification.request.content.data as { ruta?: string };
      if (ruta) router.push(ruta as Href);
    });
    return () => tocada.remove();
  }, []);

  return null;
}