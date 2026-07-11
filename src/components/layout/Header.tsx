"use client";

import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {

  const { usuario } = useAuth();

  const nome = usuario?.nome || "Usuário";

  const perfil = usuario?.perfil || "";

  const inicial = nome.charAt(0).toUpperCase();

  return (

    <header className="h-20 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-8">

      <div>

        <h1 className="text-2xl font-bold text-white">

          Dashboard

        </h1>

        <p className="text-zinc-400 text-sm">

          Bem-vindo ao Kenai CRM

        </p>

      </div>

      <div className="flex items-center gap-5">

        <button className="relative">

          <Bell
            className="text-zinc-400"
            size={22}
          />

        </button>

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">

            {inicial}

          </div>

          <div>

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