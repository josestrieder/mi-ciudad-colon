import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import {
  ingresar as ingresarEnServidor,
  obtenerPerfil,
  registrar as registrarEnServidor,
  salir,
  type DatosRegistro,
} from '@/servicios/auth';
import { ErrorDeApi } from '@/servicios/cliente';
import { borrarToken, guardarToken, leerToken } from '@/servicios/token';
import type { Usuario } from '@/tipos';

type Estado =
  | { fase: 'cargando' }
  | { fase: 'sin-sesion' }
  | { fase: 'con-sesion'; usuario: Usuario };

type ValorSesion = {
  estado: Estado;
  ingresar: (email: string, password: string) => Promise<void>;
  registrar: (datos: DatosRegistro) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

const SesionContext = createContext<ValorSesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' });

  // Al abrir la app: si hay un token guardado, lo usamos para recuperar la sesión.
  useEffect(() => {
    let cancelado = false;

    async function restaurar() {
      try {
        const token = await leerToken();
        if (!token) {
          if (!cancelado) setEstado({ fase: 'sin-sesion' });
          return;
        }
        const usuario = await obtenerPerfil(token);
        if (!cancelado) setEstado({ fase: 'con-sesion', usuario });
      } catch (error) {
        // Sólo borramos el token si el servidor dijo que ya no sirve.
        // Si falló por falta de conexión, lo conservamos para reintentar después.
        if (error instanceof ErrorDeApi && error.codigo === 'SESION_INVALIDA') {
          await borrarToken();
        }
        if (!cancelado) setEstado({ fase: 'sin-sesion' });
      }
    }

    restaurar();
    return () => {
      cancelado = true;
    };
  }, []);

  async function ingresar(email: string, password: string) {
    const { usuario, token } = await ingresarEnServidor(email, password);
    await guardarToken(token);
    setEstado({ fase: 'con-sesion', usuario });
  }

  async function registrar(datos: DatosRegistro) {
    const { usuario, token } = await registrarEnServidor(datos);
    await guardarToken(token);
    setEstado({ fase: 'con-sesion', usuario });
  }

  async function cerrarSesion() {
    try {
      const token = await leerToken();
      if (token) await salir(token); // avisarle al servidor para que revoque la sesión
    } catch {
      // Sin conexión: igual cerramos acá.
    } finally {
      await borrarToken();
      setEstado({ fase: 'sin-sesion' });
    }
  }

  return (
    <SesionContext value={{ estado, ingresar, registrar, cerrarSesion }}>
      {children}
    </SesionContext>
  );
}

export function useSesion() {
  const sesion = use(SesionContext);
  if (!sesion) throw new Error('Falta <SesionProvider>');
  return sesion;
}