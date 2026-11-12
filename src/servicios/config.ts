/**
 * Controles del mock. Sirven para ver en pantalla los estados que el PRD
 * exige (carga, vacío y error) sin esperar a que falle una API real.
 *
 *  - "normal": devuelve los datos de src/mocks.
 *  - "vacio":  todas las listas vienen vacías.
 *  - "error":  toda llamada falla con SIN_CONEXION.
 *
 * Cuando llegue la API de la cátedra, esto deja de usarse.
 */
export type ModoMock = "normal" | "vacio" | "error";

export const configuracionMock: { modo: ModoMock; demoraMs: number } = {
  modo: "error",
  demoraMs: 600,
};