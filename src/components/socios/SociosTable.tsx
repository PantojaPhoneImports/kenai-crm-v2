"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Search,
  Pencil,
  Trash2,
  UserPlus,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  listarSocios,
  excluirSocio,
} from "../../services/socios";

export default function SociosTable() {

  const [socios, setSocios] = useState<any[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {

    const dados = await listarSocios();

    setSocios(dados);

  }

  async function apagar(id: string) {

    const confirmar = confirm(
      "Deseja excluir este sócio?"
    );

    if (!confirmar) return;

    await excluirSocio(id);

    carregar();

  }

  const lista = useMemo(() => {

    const texto = busca.toLowerCase();

    return socios.filter((socio: any) => {

      return (

        socio.nome?.toLowerCase().includes(texto)

        ||

        socio.telefone?.includes(busca)

        ||

        socio.email?.toLowerCase().includes(texto)

      );

    });

  }, [socios, busca]);

  return (

    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div className="relative w-96">

          <Search
            size={18}
            className="absolute left-3 top-3 text-zinc-500"
          />

          <Input
            placeholder="Pesquisar sócio..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />

        </div>

        <Link href="/socios/novo">

          <Button>

            <UserPlus
              size={18}
              className="mr-2"
            />

            Novo Sócio

          </Button>

        </Link>

      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">

        <table className="w-full">

          <thead className="bg-zinc-800">

            <tr>

              <th className="p-4 text-left">
                Nome
              </th>

              <th className="p-4 text-left">
                Telefone
              </th>

              <th className="p-4 text-left">
                E-mail
              </th>

              <th className="p-4 text-center">
                %
              </th>

              <th className="p-4 text-center">
                Status
              </th>

              <th className="p-4 text-center">
                Ações
              </th>

            </tr>

          </thead>

          <tbody>

            {lista.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="py-12 text-center text-zinc-500"
                >

                  Nenhum sócio encontrado.

                </td>

              </tr>

            ) : (

              lista.map((socio: any) => (

                <tr
                  key={socio.id}
                  className="border-t border-zinc-800 hover:bg-zinc-800/40 transition-colors"
                >

                  <td className="p-4 text-white font-medium">
                    {socio.nome}
                  </td>

                  <td className="p-4">
                    {socio.telefone}
                  </td>

                  <td className="p-4">
                    {socio.email}
                  </td>

                  <td className="p-4 text-center">
                    {socio.percentual}%
                  </td>

                  <td className="p-4 text-center">

                    {socio.status === "ATIVO" ? (

                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">

                        Ativo

                      </span>

                    ) : (

                      <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold">

                        Inativo

                      </span>

                    )}

                  </td>

                  <td className="p-4">

                    <div className="flex justify-center gap-2">

                      <Link href={`/socios/${socio.id}`}>

                        <Button
                          className="bg-green-600 hover:bg-green-700"
                        >

                          Perfil

                        </Button>

                      </Link>

                      <Button
                        size="icon"
                        variant="outline"
                      >

                        <Pencil size={17} />

                      </Button>

                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => apagar(socio.id)}
                      >

                        <Trash2 size={17} />

                      </Button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}