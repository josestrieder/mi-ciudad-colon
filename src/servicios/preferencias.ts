import Storage from 'expo-sqlite/kv-store';

const CLAVE_BIOMETRIA = 'usar_biometria';

export async function leerUsarBiometria(): Promise<boolean> {
  return (await Storage.getItem(CLAVE_BIOMETRIA)) === 'si';
}

export async function guardarUsarBiometria(valor: boolean): Promise<void> {
  await Storage.setItem(CLAVE_BIOMETRIA, valor ? 'si' : 'no');
}