import * as SecureStore from 'expo-secure-store';

const CLAVE_TOKEN = 'token';

export const guardarToken = (token: string) => SecureStore.setItemAsync(CLAVE_TOKEN, token);
export const leerToken = () => SecureStore.getItemAsync(CLAVE_TOKEN); // null si no hay
export const borrarToken = () => SecureStore.deleteItemAsync(CLAVE_TOKEN);
