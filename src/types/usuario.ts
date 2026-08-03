import type { PerfilUsuario } from "@/lib/socio";

export interface Usuario {
  id?: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario | string;
  ativo?: boolean;
  cargo?: string;
  /** Referência canônica para `socios/{socioId}`. */
  socioId?: string;
}
