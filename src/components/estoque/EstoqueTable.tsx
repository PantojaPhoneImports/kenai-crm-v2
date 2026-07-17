"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  listarProdutos,
  excluirProduto,
} from "@/services/estoque";

import { Produto } from "@/types/produto";

export default function EstoqueTable() {

  const [produtos, setProdutos] = useState<Produto[]>([]);

  useEffect(() => {

    carregarProdutos();

  }, []);

  async function carregarProdutos() {

    const dados = await listarProdutos();

    setProdutos(dados);

  }

  async function apagar(id: string) {

    const confirmar = confirm(
      "Deseja realmente excluir este produto?"
    );

    if (!confirmar) return;

    await excluirProduto(id);

    carregarProdutos();

  }

  return (

    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">

      <table className="w-full">

        <thead className="bg-zinc-800">

          <tr>

            <th className="p-4 text-left text-zinc-300">

              Produto

            </th>

            <th className="p-4 text-left text-zinc-300">

              Marca

            </th>

            <th className="p-4 text-left text-zinc-300">

              Modelo

            </th>

            <th className="p-4 text-left text-zinc-300">

              IMEI

            </th>

            <th className="p-4 text-left text-zinc-300">

              Venda

            </th>

            <th className="p-4 text-left text-zinc-300">

              Investidor

            </th>

            <th className="p-4 text-center text-zinc-300">

              Status

            </th>

            <th className="p-4 text-center text-zinc-300">

              Ações

            </th>

          </tr>

        </thead>

        <tbody>

          {produtos.map((produto) => (

            <tr

              key={produto.id}

              className="border-t border-zinc-800 hover:bg-zinc-800/40 transition"

            >

              <td className="p-4 text-white font-medium">

                {produto.nome}

              </td>

              <td className="p-4 text-zinc-400">

                {produto.marca}

              </td>

              <td className="p-4 text-zinc-400">

                {produto.modelo}

              </td>

              <td className="p-4 text-zinc-400">

                {produto.imei}

              </td>

              <td className="p-4 text-green-400 font-semibold">

                R$ {Number(produto.venda).toFixed(2)}

              </td>

              <td className="p-4">                {produto.socioNome ? (

                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">

                    👤 {produto.socioNome}

                  </span>

                ) : (

                  <span className="text-zinc-500">

                    Empresa

                  </span>

                )}

              </td>

              <td className="p-4 text-center">

                {produto.status === "DISPONIVEL" && (

                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">

                    Disponível

                  </span>

                )}

                {produto.status === "VENDIDO" && (

                  <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold">

                    Vendido

                  </span>

                )}

                {produto.status === "RESERVADO" && (

                  <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">

                    Reservado

                  </span>

                )}

                {produto.status === "MANUTENCAO" && (

                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">

                    Manutenção

                  </span>

                )}

              </td>

              <td className="p-4">

                <div className="flex justify-center gap-2">

                  <Link href={`/estoque/${produto.id}`}>

                    <button className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition">

                      Editar

                    </button>

                  </Link>

                  {produto.status === "DISPONIVEL" && (

  <Link href="/vendas/nova">

    <button
      className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm"
    >

      Vender

    </button>

  </Link>

)}

                  <button
                    onClick={() => apagar(produto.id!)}
                    className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition"
                  >

                    Excluir

                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}