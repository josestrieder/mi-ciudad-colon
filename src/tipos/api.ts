// Forma de las respuestas de la API (según el PRD).
// Éxito:  { "datos": [ ... ], "meta": { "total": 42, "pagina": 1, "porPagina": 20 } }
// Error:  { "error": { "codigo": "LUGAR_NO_ENCONTRADO", "mensaje": "No existe ese lugar." } }

export interface Meta {
  total: number;
  pagina: number;
  porPagina: number;
}

export interface RespuestaLista<T> {
  datos: T[];
  meta: Meta;
}

export interface CuerpoError {
  codigo: string;
  mensaje: string;
}

export interface RespuestaError {
  error: CuerpoError;
}