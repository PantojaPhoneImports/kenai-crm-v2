"use client";

import Link from "next/link";

import {
  DollarSign,
  Pencil,
  Trash2,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";

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

    <div className="border-t border-zinc-800 px-6 py-5 hover:bg-zinc-800/40 transition">

      <div className="grid grid-cols-6 gap-6 items-center">

        <div>

          <p className="text-white font-semibold">

            {parcela.produtoNome}

          </p>

        </div>

        <div className="text-center">

          <span className="text-zinc-300">

            {parcela.parcela}/{parcela.totalParcelas}

          </span>

        </div>

        <div className="text-center">

          <span
            className={
              atrasada
                ? "text-red-400 font-bold"
                : "text-zinc-300"
            }
          >

            {vencimento.toLocaleDateString("pt-BR")}

          </span>

        </div>

        <div className="text-center">

          <span className="text-green-400 font-bold">

            {Number(parcela.valor).toLocaleString(
              "pt-BR",
              {
                style: "currency",
                currency: "BRL",
              }
            )}

          </span>

        </div>

        <div className="text-center">

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

        <div className="flex justify-end gap-2">

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