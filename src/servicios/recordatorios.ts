import * as Notifications from 'expo-notifications';

import type { Evento } from '@/tipos';
import { horaDe } from '@/utils/fechas';
import { CANAL_EVENTOS } from './notificaciones';

export const MINUTOS_ANTES = 60; // para probar se puede subir (ver «Cómo probarlo»)

type DatosAviso = { eventoId?: string; usuarioId?: string; ruta?: string };

const datosDe = (aviso: Notifications.NotificationRequest): DatosAviso =>
  (aviso.content.data ?? {}) as DatosAviso;

/** Qué eventos tienen un aviso programado: { idDelEvento: idDeLaNotificación }. */
export async function leerRecordatorios(usuarioId: string): Promise<Record<string, string>> {
  const programadas = await Notifications.getAllScheduledNotificationsAsync();
  const resultado: Record<string, string> = {};
  for (const aviso of programadas) {
    const datos = datosDe(aviso);
    if (datos.eventoId && datos.usuarioId === usuarioId) {
      resultado[datos.eventoId] = aviso.identifier;
    }
  }
  return resultado;
}

export async function cancelarRecordatorio(usuarioId: string, eventoId: string): Promise<void> {
  const programadas = await Notifications.getAllScheduledNotificationsAsync();
  for (const aviso of programadas) {
    const datos = datosDe(aviso);
    if (datos.eventoId === eventoId && datos.usuarioId === usuarioId) {
      await Notifications.cancelScheduledNotificationAsync(aviso.identifier);
    }
  }
}

export type ResultadoProgramar = { tipo: 'programado'; inmediato: boolean } | { tipo: 'ya-empezo' };

export async function programarRecordatorio(
  usuarioId: string,
  evento: Evento,
): Promise<ResultadoProgramar> {
  const ahora = Date.now();
  const inicio = new Date(evento.inicio).getTime();
  if (inicio <= ahora) return { tipo: 'ya-empezo' };

  await cancelarRecordatorio(usuarioId, evento.id); // reprogramar sin cancelar duplica

  const deseada = inicio - MINUTOS_ANTES * 60_000;
  const inmediato = deseada <= ahora + 10_000; // si falta menos de una hora, avisa en unos segundos
  const cuando = new Date(inmediato ? ahora + 10_000 : deseada);
  const lugar = evento.direccionLibre ? ` · ${evento.direccionLibre}` : '';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: evento.titulo,
      body: `Empieza a las ${horaDe(evento.inicio)} hs${lugar}`,
      data: {
        eventoId: evento.id,
        usuarioId,
        ruta: evento.lugarId ? `/lugar/${evento.lugarId}` : '/agenda',
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: cuando,
      channelId: CANAL_EVENTOS,
    },
  });
  return { tipo: 'programado', inmediato };
}

/** Si un evento se suspendió o canceló, su aviso ya no corresponde. */
export async function limpiarRecordatoriosInvalidos(eventos: Evento[]): Promise<void> {
  const noVigentes = new Set(eventos.filter((e) => e.estado !== 'programado').map((e) => e.id));
  if (noVigentes.size === 0) return;

  const programadas = await Notifications.getAllScheduledNotificationsAsync();
  for (const aviso of programadas) {
    const { eventoId } = datosDe(aviso);
    if (eventoId && noVigentes.has(eventoId)) {
      await Notifications.cancelScheduledNotificationAsync(aviso.identifier);
    }
  }
}