"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Search,
  AlertTriangle,
} from "lucide-react";

import {
  listarParcelas,
  receberParcela,
} from "@/services/parcelas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ReceberModal from "./ReceberModal";

export default function FinanceiroTable() {

  const [parcelas, setParcelas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");

  const [modalAberto, setModalAberto] =
    useState(false);

  const [parcelaSelecionada, setParcelaSelecionada] =
    useState<any>(null);

  useEffect(() => {
    carregarParcelas();
  }, []);

  async function carregarParcelas() {

    const dados = await listarParcelas();

    dados.sort((a: any, b: any) => {

      const dataA = a.vencimento?.seconds
        ? a.vencimento.seconds
        : new Date(a.vencimento).getTime() / 1000;

      const dataB = b.vencimento?.seconds
        ? b.vencimento.seconds
        : new Date(b.vencimento).getTime() / 1000;

      return dataA - dataB;

    });

    setParcelas(dados);

  }

  function abrirModal(parcela: any) {

    setParcelaSelecionada(parcela);

    setModalAberto(true);

  }

  async function confirmarRecebimento(
    formaPagamento: string,
    dataPagamento: string,
    observacao: string
  ) {

    if (!parcelaSelecionada) return;

    await receberParcela(

      parcelaSelecionada.id,

      formaPagamento,

      dataPagamento,

      observacao

    );

    setModalAberto(false);

    setParcelaSelecionada(null);

    carregarParcelas();

  }

  const parcelasFiltradas = useMemo(() => {

    const texto = busca.toLowerCase();

    return parcelas.filter((parcela: any) => {

      return (

        parcela.clienteNome
          ?.toLowerCase()
          .includes(texto)

        ||

        parcela.produtoNome
          ?.toLowerCase()
          .includes(texto)

      );

    });

  }, [parcelas, busca]);

  return (    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div className="relative w-96">

          <Search
            size={18}
            className="absolute left-3 top-3 text-zinc-500"
          />

          <Input
            placeholder="Pesquisar cliente ou produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />

        </div>

        <div className="flex gap-3">

          <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl">

            Atrasadas: {

              parcelas.filter((p: any) => {

                if (p.status === "PAGA") return false;

                const vencimento = p.vencimento?.seconds
                  ? new Date(p.vencimento.seconds * 1000)
                  : new Date(p.vencimento);

                return vencimento < new Date();

              }).length

            }

          </div>

          <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl">

            Pendentes: {

              parcelas.filter(
                (p: any) => p.status !== "PAGA"
              ).length

            }

          </div>

          <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl">

            Pagas: {

              parcelas.filter(
                (p: any) => p.status === "PAGA"
              ).length

            }

          </div>

        </div>

      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">

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
                Parcela
              </th>

              <th className="p-4 text-center">
                Valor
              </th>

              <th className="p-4 text-center">
                Vencimento
              </th>

              <th className="p-4 text-center">
                Status
              </th>

              <th className="p-4 text-center">
                Ações
              </th>

            </tr>

          </thead>

          <tbody>          {parcelasFiltradas.length === 0 ? (

            <tr>

              <td
                colSpan={7}
                className="p-10 text-center text-zinc-500"
              >

                Nenhuma parcela encontrada.

              </td>

            </tr>

          ) : (

            parcelasFiltradas.map((parcela: any) => {

              const vencimento = parcela.vencimento?.seconds
                ? new Date(parcela.vencimento.seconds * 1000)
                : new Date(parcela.vencimento);

              const atrasada =
                parcela.status !== "PAGA" &&
                vencimento < new Date();

              return (

                <tr
                  key={parcela.id}
                  className={`border-t border-zinc-800 transition hover:bg-zinc-800/40 ${
                    atrasada ? "bg-red-950/20" : ""
                  }`}
                >

                  <td className="p-4 text-white">

                    {parcela.clienteNome}

                  </td>

                  <td className="p-4 text-zinc-300">

                    {parcela.produtoNome}

                  </td>

                  <td className="p-4 text-center">

                    {parcela.parcela}/{parcela.totalParcelas}

                  </td>

                  <td className="p-4 text-center text-green-400 font-semibold">

                    R$ {Number(parcela.valor).toLocaleString(
                      "pt-BR",
                      {
                        minimumFractionDigits: 2,
                      }
                    )}

                  </td>

                  <td
                    className={`p-4 text-center ${
                      atrasada
                        ? "text-red-400 font-bold"
                        : "text-zinc-300"
                    }`}
                  >

                    {vencimento.toLocaleDateString("pt-BR")}

                  </td>

                  <td className="p-4 text-center">

                    {parcela.status === "PAGA" ? (

                      <span className="text-green-400 font-bold">

                        PAGA

                      </span>

                    ) : atrasada ? (

                      <span className="text-red-400 font-bold flex items-center justify-center gap-2">

                        <AlertTriangle size={16} />

                        ATRASADA

                      </span>

                    ) : (

                      <span className="text-yellow-400 font-bold">

                        PENDENTE

                      </span>

                    )}

                  </td>

                  <td className="p-4 text-center">

                    {parcela.status !== "PAGA" && (

                      <Button
                        onClick={() =>
                          abrirModal(parcela)
                        }
                      >

                        Receber

                      </Button>

                    )}

                  </td>

                </tr>

              );

            })

          )}

        </tbody>

      </table>

      </div>

      <ReceberModal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onConfirm={confirmarRecebimento}
      />

    </div>

  );

}