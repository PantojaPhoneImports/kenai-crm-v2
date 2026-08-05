"use client";

import { Bell, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { menu } from "@/data/menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { filtrarMenuPorUsuario } from "@/lib/acesso";

export default function Header() {

  const { usuario, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const pathname = usePathname();

  const nome = usuario?.nome || "Usuário";

  const perfil = usuario?.perfil || "";

  const inicial = nome.charAt(0).toUpperCase();
  const menuFiltrado = filtrarMenuPorUsuario(menu, usuario);

  return (

    <header className="flex min-h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 sm:h-20 sm:px-6 lg:px-8">

      <div>

        <h1 className="text-lg font-bold text-white sm:text-2xl">

          Dashboard

        </h1>

        <p className="hidden text-sm text-zinc-400 sm:block">

          Bem-vindo ao Kenai CRM

        </p>

      </div>

      <div className="flex items-center gap-3 sm:gap-5">

        <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
          <SheetTrigger className="inline-flex size-11 items-center justify-center rounded-xl border border-zinc-800 text-zinc-200 lg:hidden" aria-label="Abrir menu">
            <Menu size={23} />
          </SheetTrigger>
          <SheetContent side="left" className="h-[100dvh] w-[86vw] max-w-sm overflow-hidden border-zinc-800 bg-zinc-950 p-0 text-white [padding-top:env(safe-area-inset-top)]">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pt-5">
              <div className="shrink-0 border-b border-zinc-800 pb-5 pr-10">
                <p className="text-lg font-bold">KENAI CRM</p>
                <p className="text-sm text-zinc-400">{usuario?.nome || "Usuário"}</p>
              </div>
              <nav className="sidebar-menu-scroll touch-scroll min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto py-5 overscroll-contain">
                {menuFiltrado.map((item) => {
                  const Icon = item.icon;
                  const ativo = pathname === item.href;
                  return <Link key={item.href} href={item.href} onClick={() => setMenuAberto(false)} className={`flex min-h-12 items-center gap-3 rounded-xl px-4 ${ativo ? "bg-amber-500 text-zinc-950" : "text-zinc-300 hover:bg-zinc-900"}`}><Icon size={20} />{item.title}</Link>;
                })}
              </nav>
              <div className="shrink-0 border-t border-zinc-800 py-4 [padding-bottom:env(safe-area-inset-bottom)]">
                <button type="button" onClick={async () => {
                  console.warn("[layout:drawer] logout manual acionado", { email: usuario?.email ?? null });
                  await logout();
                  window.location.href = "/login";
                }} className="min-h-12 w-full rounded-xl bg-red-600 px-4 font-semibold text-white transition hover:bg-red-700">Sair</button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <button className="relative hidden sm:block">

          <Bell
            className="text-zinc-400"
            size={22}
          />

        </button>

        <div className="flex items-center gap-2 sm:gap-3">

          <div className="w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center text-zinc-950 font-bold">

            {inicial}

          </div>

          <div className="hidden sm:block">

            <h2 className="text-white font-semibold">

              {nome}

            </h2>

            <p className="text-zinc-400 text-sm">

              {perfil}

            </p>

          </div>

        </div>

      </div>

    </header>

  );

}
