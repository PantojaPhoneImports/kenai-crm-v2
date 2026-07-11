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

    <aside className="w-72 min-h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col">

      {/* LOGO */}

      <div className="p-6 border-b border-zinc-800">

        <div className="flex justify-center">

          <Image

            src="/logo.png"

            alt="Pantoja Phone Imports"

            width={170}

            height={170}

            priority

            className="object-contain"

          />

        </div>

        <h1 className="text-center text-2xl font-bold text-white mt-5">

          KENAI CRM

        </h1>

        <p className="text-center text-sm text-zinc-500 mt-1">

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

      <nav className="flex-1 px-4 space-y-2">

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

      <div className="p-5 border-t border-zinc-800">

        <button

          onClick={async () => {

            await logout();

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