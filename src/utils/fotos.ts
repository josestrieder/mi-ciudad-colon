import { Directory, File, Paths } from 'expo-file-system';

/** Copia la foto de la caché (temporal) a documentos, donde sobrevive a los reinicios. */
export function guardarFoto(uriTemporal: string): string {
  const carpeta = new Directory(Paths.document, 'fotos');
  if (!carpeta.exists) carpeta.create();

  const definitiva = new File(carpeta, `${Date.now()}.jpg`);
  new File(uriTemporal).copy(definitiva);
  return definitiva.uri;
}

/** Borra una foto guardada. No falla si el archivo ya no está. */
export function borrarFoto(uri: string): void {
  const archivo = new File(uri);
  if (archivo.exists) archivo.delete();
}