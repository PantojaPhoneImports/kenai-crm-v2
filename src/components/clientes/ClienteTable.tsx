"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Pencil,
  Trash2,
  Search,
  User,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import {
  listarClientes,
  excluirCliente,
} from "@/services/clientes";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ClienteTable() {

  const { usuario } = useAuth();

  const [clientes, setClientes] = useState<any[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {

    if (usuario) {

      carregarClientes();

    }

  }, [usuario]);

  async function carregarClientes() {

    let dados = await listarClientes();

    if (usuario?.perfil === "SOCIO") {

  dados = dados.filter(
    (cliente: any) =>
      cliente.socioId === usuario.socioId
  );

}

    setClientes(dados);

  }

  async function apagar(id: string) {

    const confirmar = confirm(
      "Deseja realmente excluir este cliente?"
    );

    if (!confirmar) return;

    await excluirCliente(id);

    carregarClientes();

  }

  const clientesFiltrados = useMemo(() => {

    return clientes.filter((cliente) => {

      const texto = busca.toLowerCase();

      return (

        cliente.nome?.toLowerCase().includes(texto) ||

        cliente.cpf?.includes(busca) ||

        cliente.telefone?.includes(busca) ||

        cliente.profissao?.toLowerCase().includes(texto)

      );

    });

  }, [clientes, busca]);

  return (

    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div className="relative w-96">

          <Search
            size={18}
            className="absolute left-3 top-3 text-zinc-500"
          />

          <Input
            placeholder="Pesquisar cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />

        </div>

        <Link href="/clientes/novo">

          <Button>

            Novo Cliente

          </Button>

        </Link>

      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">

        <table className="w-full">

          <thead className="bg-zinc-800">

            <tr>

              <th className="p-4 text-left">Nome</th>

              <th className="p-4 text-left">CPF</th>

              <th className="p-4 text-left">Telefone</th>

              <th className="p-4 text-left">Profissão</th>

              <th className="p-4 text-center">Ações</th>

            </tr>

          </thead>

          <tbody>

            {clientesFiltrados.length === 0 ? (

              <tr>

                <td
                  colSpan={5}
                  className="py-12 text-center text-zinc-500"
                >

                  Nenhum cliente encontrado.

                </td>

              </tr>

            ) : (

              clientesFiltrados.map((cliente) => (

                <tr
                  key={cliente.id}
                  className="border-t border-zinc-800 hover:bg-zinc-800/40 transition-colors"
                >

                  <td className="p-4 text-white">

                    <Link
                      href={`/clientes/ficha/${cliente.id}`}
                      className="text-blue-400 hover:text-blue-300 hover:underline font-semibold"
                    >

                      {cliente.nome}

                    </Link>

                  </td>

                  <td className="p-4">{cliente.cpf}</td>

                  <td className="p-4">{cliente.telefone}</td>

                  <td className="p-4">{cliente.profissao}</td>

                  <td className="p-4">

                    <div className="flex justify-center gap-2">

                      <Link href={`/clientes/ficha/${cliente.id}`}>

                        <Button
                          size="icon"
                          className="bg-blue-600 hover:bg-blue-700"
                        >

                          <User size={17} />

                        </Button>

                      </Link>

                      <Link href={`/clientes/${cliente.id}`}>

                        <Button
                          size="icon"
                          variant="outline"
                        >

                          <Pencil size={17} />

                        </Button>

                      </Link>

                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => apagar(cliente.id)}
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