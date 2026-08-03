export type PerfilUsuario = "ADMIN" | "ADMINISTRADOR" | "SOCIO" | "FUNCIONARIO";

export interface UsuarioAutenticado {
  id?: string;
  nome?: string;
  email: string;
  perfil: PerfilUsuario | string;
  /** ID do documento correspondente em `socios`, nunca o ID de `usuarios` ou o UID do Auth. */
  socioId?: string;
}

export interface ComSocioId {
  socioId?: string | null;
}

export function usuarioEhSocio(usuario: UsuarioAutenticado | null | undefined) {
  return usuario?.perfil?.toUpperCase() === "SOCIO";
}

export function possuiSocioId(valor: unknown): valor is string {
  return typeof valor === "string" && valor.trim().length > 0;
}

export function pertenceAoSocio(
  registro: ComSocioId,
  socioId: string | null | undefined
) {
  return possuiSocioId(socioId) && registro.socioId === socioId;
}

export function filtrarPorSocio<T extends object>(
  registros: T[],
  usuario: UsuarioAutenticado | null | undefined
) {
  if (!usuarioEhSocio(usuario)) return registros;

  if (!possuiSocioId(usuario?.socioId)) return [];

  return registros.filter((registro) =>
    pertenceAoSocio(registro as ComSocioId, usuario.socioId)
  );
}
