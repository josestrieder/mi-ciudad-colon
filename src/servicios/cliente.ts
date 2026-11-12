import * as Network from "expo-network";

import type { RespuestaLista } from "@/tipos";
import { configuracionMock } from "./config";

/** Error con la forma { codigo, mensaje } que va a devolver la API real. */
export class ErrorDeApi extends Error {
  codigo: string;

  constructor(codigo: string, mensaje: string) {
    super(mensaje);
    this.name = "ErrorDeApi";
    this.codigo = codigo;
  }
}

const esperar = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms));

/**
 * Simula el viaje por la red: demora y falla si el modo de prueba es "error"
 * o si el teléfono realmente no tiene internet (modo avión, sin señal).
 */
export async function simularRed(): Promise<void> {
  await esperar(configuracionMock.demoraMs);
  const red = await Network.getNetworkStateAsync();
  if (configuracionMock.modo === "error" || red.isInternetReachable === false) {
    throw new ErrorDeApi("SIN_CONEXION", "No hay conexión con el servidor.");
  }
}

/** En modo "vacio" las listas llegan sin elementos. */
export function fuente<T>(datos: T[]): T[] {
  return configuracionMock.modo === "vacio" ? [] : datos;
}

/** Arma la respuesta { datos, meta } paginada, como la va a devolver la API. */
export function paginar<T>(items: T[], pagina = 1, porPagina = 20): RespuestaLista<T> {
  const inicio = (pagina - 1) * porPagina;
  return {
    datos: items.slice(inicio, inicio + porPagina),
    meta: { total: items.length, pagina, porPagina },
  };
}

/** Para buscar por nombre sin importar mayúsculas ni tildes. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}