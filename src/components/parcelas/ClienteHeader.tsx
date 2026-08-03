"use client";

import Link from "next/link";
import { AlertTriangle, ChevronDown, ChevronRight, MessageCircle, Phone } from "lucide-react";
import { gerarMensagemWhatsapp } from "@/utils/whatsapp";

interface Props {
  aberto: boolean;
  setAberto: (valor: boolean) => void;
  cliente: string;
  telefone?: string;
  alerta: "OK" | "3DIAS" | "HOJE" | "ATRASADO";
  parcelas: any[];
  socioNome?: string;
  produto?: string;
  restantes: number;
}

export default function ClienteHeader({ aberto, setAberto, cliente, telefone, alerta, parcelas, socioNome, produto, restantes }: Props) {
  const primeiraParcela = parcelas.find((p) => p.status !== "PAGA") || parcelas[0];
  const numero = telefone ? telefone.replace(/\D/g, "") : "";
  const mensagem = primeiraParcela ? gerarMensagemWhatsapp(primeiraParcela) : "";
  const diogo = socioNome?.toLowerCase().includes("diogo");

  return <button onClick={() => setAberto(!aberto)} className="w-full p-5 text-left transition hover:bg-zinc-800/40 sm:p-6">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate text-xl font-bold text-white sm:text-2xl">{cliente}</h2>
          {socioNome && <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${diogo ? "bg-blue-500/20 text-blue-300" : "bg-amber-500/20 text-amber-300"}`}>{socioNome}</span>}
          {aberto ? <ChevronDown size={20} className="text-zinc-400" /> : <ChevronRight size={20} className="text-zinc-400" />}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
          {produto && <span className="font-medium text-zinc-300">{produto}</span>}
          <span>{restantes} {restantes === 1 ? "parcela restante" : "parcelas restantes"}</span>
          <span className="inline-flex items-center gap-1"><Phone size={14} /> {telefone || "Telefone não informado"}</span>
          {numero && <Link target="_blank" href={`https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"><MessageCircle size={14} /> WhatsApp</Link>}
        </div>
        {alerta === "ATRASADO" && <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-400"><AlertTriangle size={14} /> Cliente com parcela em atraso</span>}
      </div>
    </div>
  </button>;
}
