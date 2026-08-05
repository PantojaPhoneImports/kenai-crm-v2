"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

import {

  Receipt,

  DollarSign,

  Plus,

  Pencil,

  Trash2,

} from "lucide-react";

import {

  listarDespesas,

  excluirDespesa,

} from "../../services/despesas";

export default function DespesaDashboard() {

  const { usuario, loading } = useAuth();

  const [despesas, setDespesas] = useState<any[]>([]);

  const [total, setTotal] = useState(0);

  useEffect(() => {

    if (!loading && usuario?.perfil !== "SOCIO") carregar();

  }, [loading, usuario]);

  async function carregar() {

    const lista = await listarDespesas();

    setDespesas(lista);

    const totalDespesas = lista.reduce(

      (total: number, despesa: any) =>

        total + Number(despesa.valor || 0),

      0

    );

    setTotal(totalDespesas);

  }

  async function apagar(id: string) {

    const confirmar = confirm(

      "Deseja excluir esta despesa?"

    );

    if (!confirmar) return;

    await excluirDespesa(id);

    carregar();

  }

  const cards = [

    {

      titulo: "Total de Despesas",

      valor: total,

      icone: DollarSign,

      cor: "text-red-400",

    },

    {

      titulo: "Quantidade",

      valor: despesas.length,

      icone: Receipt,

      cor: "text-blue-400",

      numero: true,

    },

  ];

  return (

    <div className="space-y-8">

      <div className="flex justify-between">

        <div />

        <Link href="/despesas/nova">

          <button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-5 py-3 text-white flex items-center gap-2 transition">

            <Plus size={18} />

            Nova Despesa

          </button>

        </Link>

      </div>

      <div className="grid grid-cols-2 gap-6">

        {cards.map((card) => {

          const Icon = card.icone;

          return (

            <div

              key={card.titulo}

              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"

            >

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-zinc-400 text-sm">

                    {card.titulo}

                  </p>

                  <h2 className="text-3xl font-bold text-white mt-2">

                    {card.numero

                      ? card.valor

                      : Number(card.valor).toLocaleString(

                          "pt-BR",

                          {

                            style: "currency",

                            currency: "BRL",

                          }

                        )}

                  </h2>

                </div>

                <div className="bg-zinc-800 p-3 rounded-xl">

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

        <table className="w-full">

          <thead className="bg-zinc-800">

            <tr>

              <th className="p-4 text-left">

                Descrição

              </th>

              <th className="p-4 text-center">

                Categoria

              </th>

              <th className="p-4 text-center">

                Valor

              </th>

              <th className="p-4 text-center">

                Data

              </th>

              <th className="p-4 text-center">

                Ações

              </th>

            </tr>

          </thead>

          <tbody>
                        {despesas.length === 0 ? (

              <tr>

                <td

                  colSpan={5}

                  className="text-center py-12 text-zinc-500"

                >

                  Nenhuma despesa cadastrada.

                </td>

              </tr>

            ) : (

              despesas.map((despesa: any) => (

                <tr

                  key={despesa.id}

                  className="border-t border-zinc-800 hover:bg-zinc-800/40 transition"

                >

                  <td className="p-4 text-white">

                    {despesa.descricao}

                  </td>

                  <td className="p-4 text-center">

                    {despesa.categoria}

                  </td>

                  <td className="p-4 text-center text-red-400 font-semibold">

                    {Number(despesa.valor).toLocaleString(

                      "pt-BR",

                      {

                        style: "currency",

                        currency: "BRL",

                      }

                    )}

                  </td>

                  <td className="p-4 text-center">

                    {new Date(

                      despesa.data?.seconds

                        ? despesa.data.seconds * 1000

                        : despesa.data

                    ).toLocaleDateString("pt-BR")}

                  </td>

                  <td className="p-4">

                    <div className="flex justify-center gap-2">

                      <Link

                        href={`/despesas/${despesa.id}`}

                      >

                        <button className="border border-zinc-700 rounded-lg p-2 hover:bg-zinc-800">

                          <Pencil size={16} />

                        </button>

                      </Link>

                      <button

                        onClick={() => apagar(despesa.id)}

                        className="border border-red-700 text-red-400 rounded-lg p-2 hover:bg-red-900/20"

                      >

                        <Trash2 size={16} />

                      </button>

                    </div>

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

        <div className="grid grid-cols-2 gap-6">

          <div>

            <p className="text-zinc-400">

              Quantidade de Despesas

            </p>

            <h3 className="text-3xl font-bold text-white mt-2">

              {despesas.length}

            </h3>

          </div>

          <div>

            <p className="text-zinc-400">

              Total Gasto

            </p>

            <h3 className="text-3xl font-bold text-red-400 mt-2">

              {total.toLocaleString("pt-BR", {

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
          
