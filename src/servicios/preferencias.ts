import Storage from 'expo-sqlite/kv-store';

import type { Usuario } from '@/tipos';

const CLAVE_BIOMETRIA = 'usar_biometria';
const CLAVE_PERFIL = 'perfil';

export async function leerUsarBiometria(): Promise<boolean> {
  return (await Storage.getItem(CLAVE_BIOMETRIA)) === 'si';
}

export async function guardarUsarBiometria(valor: boolean): Promise<void> {
  await Storage.setItem(CLAVE_BIOMETRIA, valor ? 'si' : 'no');
}

/** El perfil no es un secreto como el token: se puede guardar en kv-store para abrir sin conexión. */
export async function guardarPerfilLocal(usuario: Usuario): Promise<void> {
  await Storage.setItem(CLAVE_PERFIL, JSON.stringify(usuario));
}

export async function leerPerfilLocal(): Promise<Usuario | null> {
  const texto = await Storage.getItem(CLAVE_PERFIL);
  return texto ? (JSON.parse(texto) as Usuario) : null;
}

export async function borrarPerfilLocal(): Promise<void> {
  await Storage.removeItem(CLAVE_PERFIL);
}