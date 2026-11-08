import { contrasenasMock, usuarios } from "@/mocks/usuarios";
import type { Usuario } from "@/tipos";
import { ErrorDeApi, simularRed } from "./cliente";

export interface Sesion {
  usuario: Usuario;
  token: string;
}

export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
}

/** Usuario de prueba del mock: lucia@mail.com / 123456 */
export async function ingresar(email: string, password: string): Promise<Sesion> {
  await simularRed();
  const usuario = usuarios.find((u) => u.email === email.trim().toLowerCase());
  if (!usuario || contrasenasMock[usuario.email] !== password) {
    throw new ErrorDeApi("CREDENCIALES_INVALIDAS", "El email o la contraseña no son correctos.");
  }
  return { usuario, token: `mock-token-${usuario.id}` };
}

export async function registrar(datos: DatosRegistro): Promise<Sesion> {
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

/** Con un token guardado, recupera al usuario. La API real valida el token y lo devuelve. */
export async function obtenerPerfil(token: string): Promise<Usuario> {
  await simularRed();
  const id = token.replace("mock-token-", "");
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) {
    throw new ErrorDeApi("SESION_INVALIDA", "La sesión ya no es válida. Ingresá de nuevo.");
  }
  return usuario;
}

/** La API real revoca el token en el servidor. Acá no hay nada que revocar. */
export async function salir(_token: string): Promise<void> {
  await simularRed();
}