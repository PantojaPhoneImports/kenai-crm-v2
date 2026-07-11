"use client";

import Link from "next/link";

import {
  ChevronDown,
  ChevronRight,
  Phone,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";

import {
  gerarMensagemWhatsapp,
} from "@/utils/whatsapp";

interface Props {
  aberto: boolean;
  setAberto: (valor: boolean) => void;

  cliente: string;

  telefone?: string;

  alerta: "OK" | "3DIAS" | "HOJE" | "ATRASADO";

  parcelas: any[];
}

export default function ClienteHeader({
  aberto,
  setAberto,
  cliente,
  telefone,
  alerta,
  parcelas,
}: Props) {

  const primeiraParcela =
    parcelas.find((p) => p.status !== "PAGA") ||
    parcelas[0];

  const numero = telefone
    ? telefone.replace(/\D/g, "")
    : "";

  const mensagem = primeiraParcela
    ? gerarMensagemWhatsapp(primeiraParcela)
    : "";

  return (

    <button
      onClick={() => setAberto(!aberto)}
      className="w-full p-6 hover:bg-zinc-800/40 transition"
    >

      <div className="flex justify-between items-start">

        <div>

          <div className="flex items-center gap-3">

            <h2 className="text-2xl font-bold text-white">

              {cliente}

            </h2>

            {aberto ? (

              <ChevronDown
                size={20}
                className="text-zinc-400"
              />

            ) : (

              <ChevronRight
                size={20}
                className="text-zinc-400"
              />

            )}

          </div>

          <div className="flex items-center gap-2 mt-3 text-zinc-400">

            <Phone size={16} />

            <span>

              {telefone || "Telefone não informado"}

            </span>

            {numero && (

              <Link
                target="_blank"
                href={`https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`}
                onClick={(e) => e.stopPropagation()}
              >

                <div className="ml-3 bg-green-600 hover:bg-green-700 transition px-3 py-1 rounded-lg flex items-center gap-2 text-white">

                  <MessageCircle size={16} />

                  WhatsApp

                </div>

              </Link>

            )}

          </div>

          <div className="mt-4">

            {alerta === "ATRASADO" && (

              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-red-400">

                <AlertTriangle size={16} />

                Cliente com parcela em atraso

              </div>

            )}

            {alerta === "HOJE" && (

              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/20 px-3 py-1 text-yellow-400">

                📅 Parcela vence hoje

              </div>

            )}

            {alerta === "3DIAS" && (

              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-blue-400">

                🔔 Parcela vence em até 3 dias

              </div>

            )}

          </div>

        </div>

      </div>

    </button>

  );

}