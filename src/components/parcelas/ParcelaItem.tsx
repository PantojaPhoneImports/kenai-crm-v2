"use client";

import Link from "next/link";

import {
  DollarSign,
  Pencil,
  Trash2,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import ReciboPagamento from "./ReciboPagamento";

import {
  gerarMensagemWhatsapp,
  abrirWhatsapp,
} from "@/utils/whatsapp";

interface Props {
  parcela: any;
  onExcluir: (id: string) => void;
}

export default function ParcelaItem({
  parcela,
  onExcluir,
}: Props) {

  const vencimento = parcela.vencimento?.seconds
    ? new Date(parcela.vencimento.seconds * 1000)
    : new Date(parcela.vencimento);

  const atrasada =
    parcela.status !== "PAGA" &&
    vencimento < new Date();

  const telefone = parcela.clienteTelefone || "";

  return (

    <div className="border-t border-zinc-800 px-4 py-5 transition hover:bg-zinc-800/40 sm:px-6">

      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-6 sm:gap-6">

        <div>

          <p className="text-white font-semibold before:mr-2 before:text-xs before:font-medium before:text-zinc-500 before:content-['Produto:'] sm:before:hidden">

            {parcela.produtoNome}

          </p>

        </div>

        <div className="text-left sm:text-center">

          <span className="text-zinc-300 before:mr-2 before:text-xs before:font-medium before:text-zinc-500 before:content-['Parcela:'] sm:before:hidden">

            {parcela.parcela}/{parcela.totalParcelas}

          </span>

        </div>

        <div className="text-left sm:text-center">

          <span
            className={
              atrasada
                ? "text-red-400 font-bold before:mr-2 before:text-xs before:font-medium before:text-zinc-500 before:content-['Vencimento:'] sm:before:hidden"
                : "text-zinc-300 before:mr-2 before:text-xs before:font-medium before:text-zinc-500 before:content-['Vencimento:'] sm:before:hidden"
            }
          >

            {vencimento.toLocaleDateString("pt-BR")}

          </span>

        </div>

        <div className="text-left sm:text-center">

          <span className="text-green-400 font-bold before:mr-2 before:text-xs before:font-medium before:text-zinc-500 before:content-['Valor:'] sm:before:hidden">

            {Number(parcela.valor).toLocaleString(
              "pt-BR",
              {
                style: "currency",
                currency: "BRL",
              }
            )}

          </span>

        </div>

        <div className="text-left sm:text-center">

          {parcela.status === "PAGA" ? (

            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full">

              Paga

            </span>

          ) : atrasada ? (

            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full">

              Atrasada

            </span>

          ) : (

            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">

              Pendente

            </span>

          )}

        </div>

        <div className="flex flex-wrap justify-start gap-2 sm:justify-end">

          {telefone && (

            <Button
              size="icon"
              className="bg-green-600 hover:bg-green-700"
              onClick={() =>
                abrirWhatsapp(
                  telefone,
                  gerarMensagemWhatsapp(parcela)
                )
              }
            >

              <MessageCircle size={18} />

            </Button>

          )}

          {parcela.status !== "PAGA" && (

            <Link href={`/parcelas/${parcela.id}`}>

              <Button
                size="icon"
                className="bg-blue-600 hover:bg-blue-700"
              >

                <DollarSign size={18} />

              </Button>

            </Link>

          )}

          {parcela.status === "PAGA" && <ReciboPagamento parcela={parcela} />}

          <Link href={`/parcelas/editar/${parcela.id}`}>

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
            onClick={() => onExcluir(parcela.id)}
          >

            <Trash2 size={17} />

          </Button>

        </div>

      </div>

    </div>

  );

}
