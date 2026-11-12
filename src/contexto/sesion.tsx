import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import {
  ingresar as ingresarEnServidor,
  obtenerPerfil,
  registrar as registrarEnServidor,
  salir,
  type DatosRegistro,
} from '@/servicios/auth';
import { biometriaDisponible, pedirBiometria } from '@/servicios/biometria';
import { ErrorDeApi } from '@/servicios/cliente';
import {
  borrarPerfilLocal,
  guardarPerfilLocal,
  guardarUsarBiometria,
  leerPerfilLocal,
  leerUsarBiometria,
} from '@/servicios/preferencias';
import { borrarToken, guardarToken, leerToken } from '@/servicios/token';
import type { Usuario } from '@/tipos';

type Estado =
  | { fase: 'cargando' }
  | { fase: 'sin-sesion' }
  | { fase: 'bloqueada' }
  | { fase: 'con-sesion'; usuario: Usuario };

type ValorSesion = {
  estado: Estado;
  usaBiometria: boolean;
  ingresar: (email: string, password: string) => Promise<void>;
  registrar: (datos: DatosRegistro) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  desbloquear: () => Promise<boolean>;
  activarBiometria: () => Promise<boolean>;
  desactivarBiometria: () => Promise<void>;
};

const SesionContext = createContext<ValorSesion | null>(null);

/** Con un token guardado, pide el usuario al servidor. Sin conexión, usa el último perfil guardado. */
async function cargarUsuario(token: string): Promise<Estado> {
  try {
    const usuario = await obtenerPerfil(token);
    try {
      await guardarPerfilLocal(usuario);
    } catch {
      // Si no se pudo guardar la copia, seguimos con lo que llegó.
    }
    return { fase: 'con-sesion', usuario };
  } catch (error) {
    if (error instanceof ErrorDeApi && error.codigo === 'SESION_INVALIDA') {
      // El servidor dijo que el token ya no sirve.
      await borrarToken();
      await borrarPerfilLocal();
      return { fase: 'sin-sesion' };
    }
    // Sin conexión: seguimos con el último perfil que guardamos.
    const guardado = await leerPerfilLocal();
    return guardado ? { fase: 'con-sesion', usuario: guardado } : { fase: 'sin-sesion' };
  }
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' });
  const [usaBiometria, setUsaBiometria] = useState(false);

  // Al abrir la app: si hay token, la sesión se recupera sola o queda bloqueada
  // (si el usuario activó la huella). No se pide nada hasta que entre a "Yo".
  useEffect(() => {
    let cancelado = false;

    async function restaurar() {
      let siguiente: Estado = { fase: 'sin-sesion' };
      let pedirHuella = false;
      try {
        const token = await leerToken();
        if (token) {
          pedirHuella = await leerUsarBiometria();
          siguiente = pedirHuella ? { fase: 'bloqueada' } : await cargarUsuario(token);
        }
      } catch {
        // Si algo falla al leer, empezamos sin sesión.
      }
      if (!cancelado) {
        setUsaBiometria(pedirHuella);
        setEstado(siguiente);
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
    await guardarPerfilLocal(usuario);
    setEstado({ fase: 'con-sesion', usuario });
  }

  async function registrar(datos: DatosRegistro) {
    const { usuario, token } = await registrarEnServidor(datos);
    await guardarToken(token);
    await guardarPerfilLocal(usuario);
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
      await borrarPerfilLocal();
      await guardarUsarBiometria(false);
      setUsaBiometria(false);
      setEstado({ fase: 'sin-sesion' });
    }
  }

  async function desbloquear(): Promise<boolean> {
    if (!(await pedirBiometria('Desbloqueá Mi Ciudad Colón'))) return false;
    const token = await leerToken();
    if (!token) {
      setEstado({ fase: 'sin-sesion' });
      return false;
    }
    const siguiente = await cargarUsuario(token);
    setEstado(siguiente);
    return siguiente.fase === 'con-sesion';
  }

  async function activarBiometria(): Promise<boolean> {
    if (!(await biometriaDisponible())) return false;
    if (!(await pedirBiometria('Confirmá para activar la huella'))) return false;
    await guardarUsarBiometria(true);
    setUsaBiometria(true);
    return true;
  }

  async function desactivarBiometria() {
    await guardarUsarBiometria(false);
    setUsaBiometria(false);
  }

  return (
    <SesionContext
      value={{
        estado,
        usaBiometria,
        ingresar,
        registrar,
        cerrarSesion,
        desbloquear,
        activarBiometria,
        desactivarBiometria,
      }}>
      {children}
    </SesionContext>
  );
}

export function useSesion() {
  const sesion = use(SesionContext);
  if (!sesion) throw new Error('Falta <SesionProvider>');
  return sesion;
}