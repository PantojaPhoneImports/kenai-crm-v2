"use client";

import { useEffect, useState } from "react";

import { listarVendas } from "@/services/vendas";

export default function UltimasVendas() {

  const [vendas, setVendas] = useState<any[]>([]);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {

    const lista = await listarVendas();

    lista.sort((a: any, b: any) => {

      const dataA = a.createdAt?.seconds
        ? a.createdAt.seconds
        : 0;

      const dataB = b.createdAt?.seconds
        ? b.createdAt.seconds
        : 0;

      return dataB - dataA;

    });

    setVendas(lista.slice(0, 5));

  }

  return (

    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">

      <div className="p-6 border-b border-zinc-800">

        <h2 className="text-xl font-bold text-white">

          Últimas Vendas

        </h2>

      </div>

      <table className="w-full">

        <thead className="bg-zinc-800">

          <tr>

            <th className="p-4 text-left">

              Cliente

            </th>

            <th className="p-4 text-left">

              Produto

            </th>

            <th className="p-4 text-center">

              Valor

            </th>

          </tr>

        </thead>

        <tbody>          {vendas.length === 0 ? (

            <tr>

              <td
                colSpan={3}
                className="p-8 text-center text-zinc-500"
              >

                Nenhuma venda encontrada.

              </td>

            </tr>

          ) : (

            vendas.map((venda: any) => (

              <tr
                key={venda.id}
                className="border-t border-zinc-800 hover:bg-zinc-800/40 transition"
              >

                <td className="p-4 text-white">

                  {venda.clienteNome}

                </td>

                <td className="p-4 text-zinc-300">

                  {venda.produtoNome}

                </td>

                <td className="p-4 text-center text-green-400 font-semibold">

                  R$ {Number(venda.valorProduto).toLocaleString(
                    "pt-BR",
                    {
                      minimumFractionDigits: 2,
                    }
                  )}

                </td>

              </tr>

            ))

          )}        </tbody>

      </table>

    </div>

  );

}