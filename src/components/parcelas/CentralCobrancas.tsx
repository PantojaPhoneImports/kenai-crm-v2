"use client";

import { AlertTriangle, Bell, CalendarDays } from "lucide-react";

export interface ClienteCobranca {
  id: string;
  nome: string;
  valor: number;
}

interface Props {
  atrasadas: ClienteCobranca[];
  hoje: ClienteCobranca[];
  lembrar: ClienteCobranca[];
  filtroAtivo: "ATRASADO" | "HOJE" | "3DIAS" | null;
  onFiltrar: (filtro: "ATRASADO" | "HOJE" | "3DIAS") => void;
}

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CentralCobrancas({ atrasadas, hoje, lembrar, filtroAtivo, onFiltrar }: Props) {
  function Card({ titulo, cor, filtro, clientes, icone }: {
    titulo: string;
    cor: "red" | "yellow" | "blue";
    filtro: "ATRASADO" | "HOJE" | "3DIAS";
    clientes: ClienteCobranca[];
    icone: React.ReactNode;
  }) {
    const estilo = {
      red: "border-red-500/70 bg-red-500/10 text-red-400",
      yellow: "border-yellow-500/70 bg-yellow-500/10 text-yellow-400",
      blue: "border-blue-500/70 bg-blue-500/10 text-blue-400",
    }[cor];
    const total = clientes.reduce((soma, cliente) => soma + cliente.valor, 0);

    return <button
      type="button"
      onClick={() => onFiltrar(filtro)}
      className={`h-[290px] w-full overflow-hidden rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:brightness-110 ${estilo} ${filtroAtivo === filtro ? "ring-2 ring-white/70" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-300">{titulo}</p>
          <p className="mt-1 text-3xl font-bold text-white">{clientes.length}</p>
          <p className="text-xs text-zinc-400">{clientes.length === 1 ? "cliente" : "clientes"}</p>
          <p className="mt-2 font-semibold text-white">{moeda(total)}</p>
        </div>
        <div className="mt-1">{icone}</div>
      </div>

      <div className="mt-4 space-y-2">
        {clientes.slice(0, 3).map((cliente) => <div key={cliente.id} className="flex items-center justify-between gap-3 rounded-lg bg-zinc-950/65 px-3 py-2">
          <span className="truncate text-sm font-medium text-white">{cliente.nome}</span>
          <span className="shrink-0 text-xs font-semibold text-zinc-200">{moeda(cliente.valor)}</span>
        </div>)}
        {!clientes.length && <p className="pt-4 text-sm text-zinc-500">Nenhum cliente.</p>}
        {clientes.length > 3 && <p className="px-1 text-sm font-semibold text-zinc-200">+{clientes.length - 3} clientes</p>}
      </div>
    </button>;
  }

  return <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
    <Card titulo="Em atraso" cor="red" filtro="ATRASADO" clientes={atrasadas} icone={<AlertTriangle size={24} />} />
    <Card titulo="Vencem hoje" cor="yellow" filtro="HOJE" clientes={hoje} icone={<CalendarDays size={24} />} />
    <Card titulo="Vencem em 3 dias" cor="blue" filtro="3DIAS" clientes={lembrar} icone={<Bell size={24} />} />
  </div>;
}
