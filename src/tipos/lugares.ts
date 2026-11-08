export interface Coordenadas {
  latitud: number;
  longitud: number;
}

// PREGUNTA PENDIENTE para la docente: este modelo guarda un solo tramo por día,
// pero las termas tienen horario de verano y de invierno (y hay lugares que
// cierran al mediodía). Con este tipo no se puede expresar.
export interface Horario {
  dia: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = domingo
  abre: string; // "09:00"
  cierra: string; // "19:00"
}

export interface Audioguia {
  url: string;
  duracionSegundos: number;
  idioma: "es" | "en" | "pt";
}

export interface Categoria {
  id: string;
  nombre: string;
  icono: string; // nombre del ícono de Ionicons
  color: string; // hexadecimal
  orden: number;
}

export interface Lugar {
  id: string;
  nombre: string;
  categoriaId: string;
  descripcionCorta: string;
  descripcion: string;
  coordenadas: Coordenadas;
  direccion: string;
  imagenes: string[];
  horarios: Horario[];
  telefono: string | null;
  sitioWeb: string | null;
  precioEntrada: number | null; // 0 = gratis, null = no aplica
  audioguia: Audioguia | null;
  codigoQr: string | null;
  accesible: boolean;
  activo: boolean;
  actualizadoEn: string; // ISO 8601 con zona
}