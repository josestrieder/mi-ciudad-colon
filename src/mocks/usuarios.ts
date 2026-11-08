import type { Favorito, Usuario, Visita } from "@/tipos";

export const usuarios: Usuario[] = [
  {
    id: "usr-201",
    nombre: "Lucía Méndez",
    email: "lucia@mail.com",
    avatarUrl: null,
    creadoEn: "2026-09-02T18:20:00-03:00",
    preferencias: {
      categoriasFavoritas: ["cat-museos", "cat-playas"],
      avisarProximidad: true,
      radioAvisoMetros: 250,
      tema: "sistema",
    },
  },
];

// Contraseñas del mock. Sólo para desarrollo: la API real nunca las devuelve.
export const contrasenasMock: Record<string, string> = {
  "lucia@mail.com": "123456",
};

export const favoritos: Favorito[] = [
  { id: "fav-088", usuarioId: "usr-201", lugarId: "lug-004", creadoEn: "2026-11-12T09:05:00-03:00" },
];

export const visitas: Visita[] = [
  {
    id: "vis-311",
    usuarioId: "usr-201",
    lugarId: "lug-004",
    fechaHora: "2026-11-13T16:42:00-03:00",
    origen: "qr",
    fotoUri: "file:///.../visitas/vis-311.jpg",
    nota: "Hacía 38 grados pero valió la pena",
    sincronizada: false,
  },
];