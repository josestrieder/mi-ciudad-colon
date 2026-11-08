export interface Preferencias {
  categoriasFavoritas: string[];
  avisarProximidad: boolean;
  radioAvisoMetros: number; // 100, 250 o 500
  tema: "claro" | "oscuro" | "sistema";
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  avatarUrl: string | null;
  creadoEn: string;
  preferencias: Preferencias;
}

export interface Favorito {
  id: string;
  usuarioId: string;
  lugarId: string;
  creadoEn: string;
}

export type OrigenVisita = "qr" | "gps" | "manual";

export interface Visita {
  id: string;
  usuarioId: string;
  lugarId: string;
  fechaHora: string;
  origen: OrigenVisita;
  fotoUri: string | null; // ruta local hasta que se sube
  nota: string | null;
  sincronizada: boolean; // false = pendiente de subir (cola sin conexión)
}