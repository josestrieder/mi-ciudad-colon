import axios, { isAxiosError } from 'axios';

import { ErrorDeApi } from './cliente';
import { configuracionMock } from './config';
import { leerToken } from './token';

export const URL_API = process.env.EXPO_PUBLIC_API_URL ?? '';

/** Si hay una dirección configurada, los servicios hablan con la API; si no, usan los datos de prueba. */
export const usarApiReal = URL_API !== '';

type CuerpoError = { error?: { codigo?: string; mensaje?: string } };

export const api = axios.create({
  baseURL: URL_API,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Antes de cada pedido: adjuntar el token de la sesión, si hay.
api.interceptors.request.use(async (config) => {
  const token = await leerToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Para ver el estado de error con la API real: ella responde un 500 si se lo piden con esta cabecera.
  if (configuracionMock.modo === 'error') config.headers['X-Simular'] = 'error-500';
  return config;
});

// Después de cada respuesta: convertir los errores de Axios en nuestro ErrorDeApi.
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (isAxiosError(error)) {
      if (error.response) {
        // Llegó al servidor y contestó mal: la API manda { error: { codigo, mensaje } }.
        const cuerpo = error.response.data as CuerpoError | undefined;
        return Promise.reject(
          new ErrorDeApi(
            cuerpo?.error?.codigo ?? 'ERROR_INTERNO',
            cuerpo?.error?.mensaje ?? 'Algo salió mal. Probá de nuevo en un rato.',
          ),
        );
      }
      // El pedido salió y nunca volvió: sin red, servidor caído o tiempo agotado.
      return Promise.reject(new ErrorDeApi('SIN_CONEXION', 'No hay conexión con el servidor.'));
    }
    return Promise.reject(error);
  },
);