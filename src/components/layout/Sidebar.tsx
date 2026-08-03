"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { menu } from "@/data/menu";
import { useAuth } from "../../contexts/AuthContext";

export default function Sidebar() {

  const pathname = usePathname();

  const { usuario, logout } = useAuth();

  const menuFiltrado = menu.filter((item) => {

    if (!usuario) return true;

    const perfil = (usuario.perfil || "").toUpperCase();

    if (
      perfil === "ADMIN" ||
      perfil === "ADMINISTRADOR"
    ) {

      return true;

    }

    const permitido = [

      "/dashboard",

      "/clientes",

      "/estoque",

      "/vendas",

      "/financeiro",

    ];

    return permitido.includes(item.href);

  });

  return (

    <aside className="sticky top-0 hidden h-[100dvh] min-h-0 w-72 flex-col overflow-hidden border-r border-zinc-800 bg-zinc-950 lg:flex">

      {/* LOGO */}

      <div className="p-6 border-b border-zinc-800">

        <div className="flex justify-center">

          <Image
  src="/logo.png"
  alt="Pantoja Phone Imports"
  width={190}
  height={190}
  priority
  className="mx-auto object-contain select-none"
/>

        </div>

        <h1 className="text-center text-3xl font-bold tracking-wide text-white mt-4">

          KENAI CRM

        </h1>

        <p className="text-center text-zinc-400 text-sm mt-1 tracking-wide">

          by Pantoja Phone Imports

        </p>

      </div>

      {/* USUÁRIO */}

      <div className="p-6">

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

          <p className="text-lg font-bold text-white">

            {usuario?.nome || "Usuário"}

          </p>

          <p className="text-zinc-400 mt-1">

            {usuario?.perfil || ""}

          </p>

        </div>

      </div>

      {/* MENU */}

      <nav className="touch-scroll min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto px-4 py-2 overscroll-contain">

        {menuFiltrado.map((item) => {

          const Icon = item.icon;

          const ativo = pathname === item.href;

          return (

            <Link

              key={item.href}

              href={item.href}

              className={`

                flex

                items-center

                gap-3

                px-4

                py-3

                rounded-xl

                transition-all

                duration-300

                ${

                  ativo

                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"

                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"

                }

              `}

            >

              <Icon size={20} />

              <span className="font-medium">

                {item.title}

              </span>

            </Link>

          );

        })}

      </nav>

      {/* BOTÃO SAIR */}

      <div className="shrink-0 border-t border-zinc-800 p-5">

        <button

          onClick={async () => {

            console.warn("[layout:sidebar] logout manual acionado", {
              email: usuario?.email ?? null,
            });
            await logout();

            console.warn("[layout:sidebar] redirecionando manualmente para /login", {
              motivo: "usuário acionou o botão Sair",
            });
            window.location.href = "/login";

          }}

          className="w-full rounded-xl bg-red-600 hover:bg-red-700 transition py-3 text-white font-semibold"

        >

          Sair

        </button>

      </div>

    </aside>

  );

}
