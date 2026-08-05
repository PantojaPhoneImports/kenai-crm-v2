import type { UsuarioAutenticado } from "@/lib/socio";

const ROTAS_SOCIO = ["/dashboard", "/clientes", "/estoque", "/parcelas", "/cobranca-whatsapp"] as const;

export function usuarioEhAdministrador(usuario: UsuarioAutenticado | null | undefined) {
  const perfil = usuario?.perfil?.toUpperCase();
  return perfil === "ADMIN" || perfil === "ADMINISTRADOR";
}

export function socioPodeAcessarRota(pathname: string) {
  if (pathname === "/cobranca-whatsapp") return true;
  return ROTAS_SOCIO
    .filter((rota) => rota !== "/cobranca-whatsapp")
    .some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));
}

export function usuarioPodeAcessarRota(usuario: UsuarioAutenticado | null | undefined, pathname: string) {
  return !usuario || usuarioEhAdministrador(usuario) || socioPodeAcessarRota(pathname);
}

export function filtrarMenuPorUsuario<T extends { href: string }>(menu: T[], usuario: UsuarioAutenticado | null | undefined) {
  return menu.filter((item) => usuarioPodeAcessarRota(usuario, item.href));
}
