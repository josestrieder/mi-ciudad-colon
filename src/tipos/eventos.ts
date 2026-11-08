import type { Coordenadas } from "./lugares";

export type EstadoEvento = "programado" | "suspendido" | "cancelado" | "finalizado";

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  lugarId: string | null;
  direccionLibre: string | null;
  coordenadas: Coordenadas | null; // sólo si no hay lugarId
  inicio: string; // ISO 8601 con zona
  fin: string | null;
  imagenUrl: string | null;
  precio: number | null; // 0 = gratis, null = no aplica
  estado: EstadoEvento;
}