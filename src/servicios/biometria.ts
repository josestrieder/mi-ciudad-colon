import * as LocalAuthentication from 'expo-local-authentication';

/** ¿El teléfono tiene lector y el usuario registró huella o rostro? */
export async function biometriaDisponible(): Promise<boolean> {
  const hayLector = await LocalAuthentication.hasHardwareAsync();
  if (!hayLector) return false;
  return LocalAuthentication.isEnrolledAsync();
}

/** Pide la huella o el rostro. Devuelve true si el usuario se identificó. */
export async function pedirBiometria(mensaje: string): Promise<boolean> {
  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: mensaje,
    cancelLabel: 'Cancelar',
  });
  return resultado.success;
}