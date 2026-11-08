import type { Categoria } from "@/tipos";

export const categorias: Categoria[] = [
  { id: "cat-playas", nombre: "Playas", icono: "sunny-outline", color: "#E0A100", orden: 1 },
  { id: "cat-termas", nombre: "Termas", icono: "thermometer-outline", color: "#C2410C", orden: 2 },
  { id: "cat-museos", nombre: "Museos y patrimonio", icono: "business-outline", color: "#8E5A4A", orden: 3 },
  { id: "cat-gastronomia", nombre: "Gastronomía", icono: "restaurant-outline", color: "#B91C1C", orden: 4 },
  { id: "cat-artesanias", nombre: "Artesanías", icono: "color-palette-outline", color: "#7C3AED", orden: 5 },
  { id: "cat-naturaleza", nombre: "Naturaleza", icono: "leaf-outline", color: "#15803D", orden: 6 },
  { id: "cat-alojamiento", nombre: "Alojamiento", icono: "bed-outline", color: "#0369A1", orden: 7 },
];