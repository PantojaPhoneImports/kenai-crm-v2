"use client";

import { useEffect, useState } from "react";

import {

  ArrowDownCircle,

  ArrowUpCircle,

  Wallet,

  DollarSign,

} from "lucide-react";

import { listarParcelas } from "@/services/parcelas";

export default function FluxoCaixaDashboard() {

  const [entradas, setEntradas] = useState(0);

  const [saidas, setSaidas] = useState(0);

  const [saldo, setSaldo] = useState(0);

  const [movimentos, setMovimentos] = useState<any[]>([]);

  useEffect(() => {

    carregar();

  }, []);

  async function carregar() {

    const parcelas = await listarParcelas();

    let totalEntradas = 0;

    const listaMovimentos: any[] = [];

    parcelas.forEach((parcela: any) => {

      if (parcela.status !== "PAGA") return;

      const valor = Number(parcela.valor || 0);

      totalEntradas += valor;

      listaMovimentos.push({

        tipo: "ENTRADA",

        descricao:

          parcela.clienteNome ||

          "Recebimento",

        valor,

        data: parcela.dataPagamento || parcela.vencimento,

      });

    });

    setEntradas(totalEntradas);

    setMovimentos(listaMovimentos);
        let totalSaidas = 0;

    // Aqui futuramente serão carregadas as despesas

    // Exemplo:
    // const despesas = await listarDespesas();

    // despesas.forEach((despesa: any) => {
    //   totalSaidas += Number(despesa.valor);
    //   listaMovimentos.push({
    //     tipo: "SAIDA",
    //     descricao: despesa.descricao,
    //     valor: Number(despesa.valor),
    //     data: despesa.data,
    //   });
    // });

    setSaidas(totalSaidas);

    const saldoAtual = totalEntradas - totalSaidas;

    setSaldo(saldoAtual);

    listaMovimentos.sort((a, b) => {

      const dataA = a.data?.seconds

        ? a.data.seconds * 1000

        : new Date(a.data).getTime();

      const dataB = b.data?.seconds

        ? b.data.seconds * 1000

        : new Date(b.data).getTime();

      return dataB - dataA;

    });

  }

  const cards = [

    {

      titulo: "Entradas",

      valor: entradas,

      icone: ArrowDownCircle,

      cor: "text-green-400",

    },

    {

      titulo: "Saídas",

      valor: saidas,

      icone: ArrowUpCircle,

      cor: "text-red-400",

    },
        {

      titulo: "Saldo Atual",

      valor: saldo,

      icone: Wallet,

      cor: "text-blue-400",

    },

    {

      titulo: "Caixa",

      valor: saldo,

      icone: DollarSign,

      cor: "text-yellow-400",

    },

  ];

  return (

    <div className="space-y-8">

      <div className="grid grid-cols-4 gap-6">

        {cards.map((card) => {

          const Icon = card.icone;

          return (

            <div

              key={card.titulo}

              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-blue-600 transition-all"

            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-zinc-400 text-sm">

                    {card.titulo}

                  </p>

                  <h2 className="text-3xl font-bold text-white mt-2">

                    {Number(card.valor).toLocaleString(

                      "pt-BR",

                      {

                        style: "currency",

                        currency: "BRL",

                      }

                    )}

                  </h2>

                </div>

                <div className="bg-zinc-800 rounded-xl p-3">

                  <Icon

                    size={26}

                    className={card.cor}

                  />

                </div>

              </div>

            </div>

          );

        })}

      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

        <div className="p-6 border-b border-zinc-800">

          <h2 className="text-2xl font-bold text-white">

            Movimentações

          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-zinc-800">

            <tr>

              <th className="p-4 text-left">

                Tipo

              </th>

              <th className="p-4 text-left">

                Descrição

              </th>

              <th className="p-4 text-center">

                Valor

              </th>

              <th className="p-4 text-center">

                Data

              </th>

            </tr>

          </thead>

          <tbody>
                        {movimentos.length === 0 ? (

              <tr>

                <td

                  colSpan={4}

                  className="text-center py-12 text-zinc-500"

                >

                  Nenhuma movimentação encontrada.

                </td>

              </tr>

            ) : (

              movimentos.map((movimento, index) => (

                <tr

                  key={index}

                  className="border-t border-zinc-800 hover:bg-zinc-800/40 transition"

                >

                  <td className="p-4">

                    <span

                      className={`px-3 py-1 rounded-full text-sm font-semibold ${

                        movimento.tipo === "ENTRADA"

                          ? "bg-green-500/20 text-green-400"

                          : "bg-red-500/20 text-red-400"

                      }`}

                    >

                      {movimento.tipo}

                    </span>

                  </td>

                  <td className="p-4 text-white">

                    {movimento.descricao}

                  </td>

                  <td

                    className={`p-4 text-center font-semibold ${

                      movimento.tipo === "ENTRADA"

                        ? "text-green-400"

                        : "text-red-400"

                    }`}

                  >

                    {Number(movimento.valor).toLocaleString(

                      "pt-BR",

                      {

                        style: "currency",

                        currency: "BRL",

                      }

                    )}

                  </td>

                  <td className="p-4 text-center text-zinc-300">

                    {new Date(

                      movimento.data?.seconds

                        ? movimento.data.seconds * 1000

                        : movimento.data

                    ).toLocaleDateString("pt-BR")}

                  </td>

                </tr>

              ))

            )}
                      </tbody>

        </table>

      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

        <h2 className="text-2xl font-bold text-white mb-6">

          Resumo Financeiro

        </h2>

        <div className="grid grid-cols-3 gap-6">

          <div>

            <p className="text-zinc-400">

              Total de Entradas

            </p>

            <h3 className="text-2xl font-bold text-green-400 mt-2">

              {entradas.toLocaleString("pt-BR", {

                style: "currency",

                currency: "BRL",

              })}

            </h3>

          </div>

          <div>

            <p className="text-zinc-400">

              Total de Saídas

            </p>

            <h3 className="text-2xl font-bold text-red-400 mt-2">

              {saidas.toLocaleString("pt-BR", {

                style: "currency",

                currency: "BRL",

              })}

            </h3>

          </div>

          <div>

            <p className="text-zinc-400">

              Saldo Atual

            </p>

            <h3 className="text-2xl font-bold text-blue-400 mt-2">

              {saldo.toLocaleString("pt-BR", {

                style: "currency",

                currency: "BRL",

              })}

            </h3>

          </div>

        </div>

      </div>
          </div>

  );

}
          