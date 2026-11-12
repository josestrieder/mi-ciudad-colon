import { Directory, File, Paths } from 'expo-file-system';

import type { Audioguia } from '@/tipos';

// Las descargas van a la caché (no a documentos): se pueden volver a bajar.
function carpeta(): Directory {
  return new Directory(Paths.cache, 'audioguias');
}

export function archivoDeAudioguia(lugarId: string, audioguia: Audioguia): File {
  return new File(carpeta(), `${lugarId}-${audioguia.idioma}.mp3`);
}

/** Baja la audioguía al teléfono. Avisa el avance de 0 a 1 y devuelve la ruta del archivo. */
export async function descargarAudioguia(
  lugarId: string,
  audioguia: Audioguia,
  alAvanzar: (fraccion: number) => void,
): Promise<string> {
  const destino = carpeta();
  if (!destino.exists) destino.create();

  const archivo = archivoDeAudioguia(lugarId, audioguia);
  if (archivo.exists) archivo.delete(); // por si quedó una descarga a medias

  const tarea = File.createDownloadTask(audioguia.url, archivo, {
    onProgress: ({ bytesWritten, totalBytes }) => {
      // Number(...): en iOS estos valores pueden llegar como bigint.
      const total = Number(totalBytes);
      if (total > 0) alAvanzar(Number(bytesWritten) / total);
    },
  });

  try {
    await tarea.downloadAsync();
  } catch (error) {
    if (archivo.exists) archivo.delete(); // no dejamos un archivo roto
    throw error;
  }
  return archivo.uri;
}

export function borrarAudioguia(lugarId: string, audioguia: Audioguia): void {
  const archivo = archivoDeAudioguia(lugarId, audioguia);
  if (archivo.exists) archivo.delete();
}