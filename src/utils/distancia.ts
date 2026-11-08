import type { Coordenadas } from "@/tipos";

const RADIO_TIERRA_METROS = 6371000;
const aRadianes = (grados: number) => (grados * Math.PI) / 180;

/** Distancia en línea recta entre dos puntos (fórmula de Haversine), en metros. */
export function distanciaMetros(a: Coordenadas, b: Coordenadas): number {
  const dLat = aRadianes(b.latitud - a.latitud);
  const dLon = aRadianes(b.longitud - a.longitud);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(a.latitud)) * Math.cos(aRadianes(b.latitud)) * Math.sin(dLon / 2) ** 2;
  return 2 * RADIO_TIERRA_METROS * Math.asin(Math.sqrt(h));
}

/** "900 m" o "1,4 km", como en el dibujo del PRD. */
export function formatearDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros)} m`;
  return `${(metros / 1000).toFixed(1).replace(".", ",")} km`;
}