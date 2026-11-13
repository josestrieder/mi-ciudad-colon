import { visitas } from "@/mocks/usuarios";
import type { OrigenVisita, RespuestaLista, Visita } from "@/tipos";
import { ahoraEnColon, claveDia } from "@/utils/fechas";
import { borrarFoto } from "@/utils/fotos";
import { api, usarApiReal } from "./api";
import { ErrorDeApi, fuente, paginar, simularRed } from "./cliente";

// Con la API real, estas funciones piden los datos con Axios; sin ella, usan los datos de prueba.

/** La API pide la fecha como 2026-11-13T10:00:00-03:00, sin milésimas. */
const sinMilisegundos = (fecha: string) => fecha.replace(/\.\d+(?=[+-]\d{2}:\d{2}$)/, "");

function datosDeImagen(uri: string): { name: string; type: string } {
  const extension = uri.split(".").pop()?.toLowerCase() ?? "jpg";
  if (extension === "png") return { name: "foto.png", type: "image/png" };
  if (extension === "webp") return { name: "foto.webp", type: "image/webp" };
  return { name: "foto.jpg", type: "image/jpeg" };
}

/** Sube la foto a POST /archivos y devuelve la URL que hay que guardar en la visita. */
async function subirFoto(uri: string): Promise<string> {
  const formulario = new FormData();
  formulario.append("archivo", { uri, ...datosDeImagen(uri) } as unknown as Blob);
  const { data } = await api.post<{ datos: { url: string } }>("/archivos", formulario, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30_000,
  });
  return data.datos.url;
}

export async function listarVisitas(usuarioId: string): Promise<RespuestaLista<Visita>> {
  if (usarApiReal) {
    // En las visitas, la API deja pedir hasta 500 por página; las devuelve de la más vieja a la más nueva.
    const { data } = await api.get<RespuestaLista<Visita>>("/yo/visitas", {
      params: { porPagina: 500 },
    });
    const masNuevaPrimero = [...data.datos].sort((a, b) => b.fechaHora.localeCompare(a.fechaHora));
    return { datos: masNuevaPrimero, meta: data.meta };
  }

  await simularRed();
  const propias = fuente(visitas)
    .filter((v) => v.usuarioId === usuarioId)
    .sort((a, b) => b.fechaHora.localeCompare(a.fechaHora)); // la más nueva primero
  return paginar(propias, 1, propias.length || 1);
}

export async function registrarVisita(
  usuarioId: string,
  lugarId: string,
  origen: OrigenVisita,
  fechaHora: string = ahoraEnColon(),
): Promise<Visita> {
  if (usarApiReal) {
    // Regla de nuestro grupo: una visita por lugar y por día. La API permite repetir; esta regla es de la app.
    const dia = claveDia(fechaHora);
    const { datos: existentes } = await listarVisitas(usuarioId);
    if (existentes.some((v) => v.lugarId === lugarId && claveDia(v.fechaHora) === dia)) {
      throw new ErrorDeApi("VISITA_DUPLICADA", "Ya registraste este lugar hoy.");
    }

    const { data } = await api.post<{ datos: Visita }>("/yo/visitas", {
      lugarId,
      fechaHora: sinMilisegundos(fechaHora),
      origen,
    });
    return data.datos;
  }

  await simularRed();

  // Una visita por lugar y por día.
  const dia = claveDia(fechaHora);
  const yaRegistrada = visitas.some(
    (v) => v.usuarioId === usuarioId && v.lugarId === lugarId && claveDia(v.fechaHora) === dia,
  );
  if (yaRegistrada) {
    throw new ErrorDeApi("VISITA_DUPLICADA", "Ya registraste este lugar hoy.");
  }

  const nueva: Visita = {
    id: `vis-${Date.now()}`,
    usuarioId,
    lugarId,
    fechaHora,
    origen,
    fotoUri: null,
    nota: null,
    sincronizada: true, // el servidor la aceptó
  };
  visitas.push(nueva);
  return nueva;
}

export interface CambiosVisita {
  fotoUri?: string | null;
  nota?: string | null;
}

export async function actualizarVisita(
  usuarioId: string,
  visitaId: string,
  cambios: CambiosVisita,
): Promise<Visita> {
  if (usarApiReal) {
    const cuerpo: { fotoUri?: string | null; nota?: string | null } = {};
    const fotoLocal = cambios.fotoUri?.startsWith("file://") ? cambios.fotoUri : null;

    if (cambios.fotoUri !== undefined) {
      // La foto del teléfono se sube primero; el servidor guarda la URL que devuelve.
      cuerpo.fotoUri = fotoLocal ? await subirFoto(fotoLocal) : cambios.fotoUri;
    }
    if (cambios.nota !== undefined) cuerpo.nota = cambios.nota;

    const { data } = await api.patch<{ datos: Visita }>(
      `/yo/visitas/${encodeURIComponent(visitaId)}`,
      cuerpo,
    );
    if (fotoLocal) borrarFoto(fotoLocal); // ya está en el servidor: la copia del teléfono sobra
    return data.datos;
  }

  await simularRed();
  const indice = visitas.findIndex((v) => v.id === visitaId && v.usuarioId === usuarioId);
  if (indice === -1) throw new ErrorDeApi("VISITA_NO_ENCONTRADA", "No existe esa visita.");
  const actualizada: Visita = { ...visitas[indice], ...cambios };
  visitas[indice] = actualizada; // se reemplaza el objeto, no se modifica el que ya tenía la caché
  return actualizada;
}

export async function eliminarVisita(usuarioId: string, visitaId: string): Promise<void> {
  if (usarApiReal) {
    // La API de la cátedra no tiene un endpoint para borrar visitas.
    throw new ErrorDeApi("NO_SOPORTADO", "Las visitas ya subidas no se pueden quitar.");
  }

  await simularRed();
  const indice = visitas.findIndex((v) => v.id === visitaId && v.usuarioId === usuarioId);
  if (indice === -1) throw new ErrorDeApi("VISITA_NO_ENCONTRADA", "No existe esa visita.");
  visitas.splice(indice, 1);
}