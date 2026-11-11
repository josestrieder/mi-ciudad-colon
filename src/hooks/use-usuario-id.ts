import { useSesion } from '@/contexto/sesion';

/** El id del usuario con sesión, o null si no hay sesión (o está bloqueada). */
export function useUsuarioId(): string | null {
  const { estado } = useSesion();
  return estado.fase === 'con-sesion' ? estado.usuario.id : null;
}