"use client";

import { useEffect, useState } from "react";

import { listarParcelas } from "@/services/parcelas";

export default function ProximosVencimentos() {

  const [parcelas, setParcelas] = useState<any[]>([]);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {

    const lista = await listarParcelas();

    const pendentes = lista.filter(
      (item: any) => item.status !== "PAGA"
    );

    pendentes.sort((a: any, b: any) => {

      const dataA = a.vencimento?.seconds
        ? a.vencimento.seconds
        : new Date(a.vencimento).getTime() / 1000;

      const dataB = b.vencimento?.seconds
        ? b.vencimento.seconds
        : new Date(b.vencimento).getTime() / 1000;

      return dataA - dataB;

    });

    setParcelas(pendentes.slice(0, 5));

  }

  return (

    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">

      <div className="p-6 border-b border-zinc-800">

        <h2 className="text-xl font-bold text-white">

          Próximos Vencimentos

        </h2>

      </div>

      <table className="w-full">

        <thead className="bg-zinc-800">

          <tr>

            <th className="p-4 text-left">
              Cliente
            </th>

            <th className="p-4 text-center">
              Parcela
            </th>

            <th className="p-4 text-center">
              Vencimento
            </th>

          </tr>

        </thead>

        <tbody>          {parcelas.length === 0 ? (

            <tr>

              <td
                colSpan={3}
                className="p-8 text-center text-zinc-500"
              >

                Nenhum vencimento encontrado.

              </td>

            </tr>

          ) : (

            parcelas.map((parcela: any) => {

              const vencimento = parcela.vencimento?.seconds
                ? new Date(parcela.vencimento.seconds * 1000)
                : new Date(parcela.vencimento);

              const atrasada =
                vencimento < new Date();

              return (

                <tr
                  key={parcela.id}
                  className="border-t border-zinc-800 hover:bg-zinc-800/40 transition"
                >

                  <td className="p-4 text-white">

                    {parcela.clienteNome}

                  </td>

                  <td className="p-4 text-center text-zinc-300">

                    {parcela.parcela}/{parcela.totalParcelas}

                  </td>

                  <td className="p-4 text-center">

                    <span
                      className={
                        atrasada
                          ? "text-red-400 font-bold"
                          : "text-yellow-400 font-semibold"
                      }
                    >

                      {vencimento.toLocaleDateString("pt-BR")}

                    </span>

                  </td>

                </tr>

              );

            })

          )}        </tbody>

      </table>

    </div>

  );

}