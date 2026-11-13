import { contrasenasMock, usuarios } from "@/mocks/usuarios";
import type { Usuario } from "@/tipos";
import { api, usarApiReal } from "./api";
import { ErrorDeApi, simularRed } from "./cliente";

// Con la API real, estas funciones piden los datos con Axios; sin ella, usan los usuarios de prueba.

export interface Sesion {
  usuario: Usuario;
  token: string;
}

export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
}

type RespuestaSesion = { datos: Sesion };
type RespuestaUsuario = { datos: Usuario };

/**
 * El `token` se guarda con expo-secure-store (nunca en kv-store) y se envía en la cabecera
 * Authorization: Bearer <token>: de eso se ocupa el cliente de src/servicios/api.ts.
 *
 * Con la API de la cátedra: lucia@mail.com / lucia1234.
 * Con los datos de prueba (sin EXPO_PUBLIC_API_URL): lucia@mail.com / 123456.
 */
export async function ingresar(email: string, password: string): Promise<Sesion> {
  if (usarApiReal) {
    const { data } = await api.post<RespuestaSesion>("/auth/ingreso", {
      email: email.trim().toLowerCase(),
      contrasena: password,
    });
    return data.datos;
  }

  await simularRed();
  const usuario = usuarios.find((u) => u.email === email.trim().toLowerCase());
  if (!usuario || contrasenasMock[usuario.email] !== password) {
    throw new ErrorDeApi("CREDENCIALES_INVALIDAS", "El email o la contraseña no son correctos.");
  }
  return { usuario, token: `mock-token-${usuario.id}` };
}

export async function registrar(datos: DatosRegistro): Promise<Sesion> {
  if (usarApiReal) {
    const { data } = await api.post<RespuestaSesion>("/auth/registro", {
      nombre: datos.nombre.trim(),
      email: datos.email.trim().toLowerCase(),
      contrasena: datos.password,
    });
    return data.datos;
  }

  await simularRed();
  const email = datos.email.trim().toLowerCase();
  if (usuarios.some((u) => u.email === email)) {
    throw new ErrorDeApi("EMAIL_EXISTENTE", "Ya existe una cuenta con ese email.");
  }
  if (datos.password.length < 6) {
    throw new ErrorDeApi("DATOS_INVALIDOS", "La contraseña debe tener al menos 6 caracteres.");
  }
  const usuario: Usuario = {
    id: `usr-${200 + usuarios.length + 1}`,
    nombre: datos.nombre.trim(),
    email,
    avatarUrl: null,
    creadoEn: new Date().toISOString(),
    preferencias: {
      categoriasFavoritas: [],
      avisarProximidad: false,
      radioAvisoMetros: 250,
      tema: "sistema",
    },
  };
  usuarios.push(usuario);
  contrasenasMock[email] = datos.password;
  return { usuario, token: `mock-token-${usuario.id}` };
}

/** Con un token guardado, pide el usuario. Si el token ya no sirve, falla con SESION_INVALIDA. */
export async function obtenerPerfil(token: string): Promise<Usuario> {
  if (usarApiReal) {
    try {
      const { data } = await api.get<RespuestaUsuario>("/yo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.datos;
    } catch (error) {
      if (error instanceof ErrorDeApi && error.codigo === "NO_AUTENTICADO") {
        throw new ErrorDeApi("SESION_INVALIDA", "Tu sesión venció. Ingresá de nuevo.");
      }
      throw error;
    }
  }

  await simularRed();
  const id = token.replace("mock-token-", "");
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) throw new ErrorDeApi("SESION_INVALIDA", "Tu sesión venció. Ingresá de nuevo.");
  return usuario;
}

/** La API no tiene un endpoint para cerrar sesión: el token deja de usarse al borrarlo del teléfono. */
export async function salir(token: string): Promise<void> {
  void token;
  if (!usarApiReal) await simularRed();
}