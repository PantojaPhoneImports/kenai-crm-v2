"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  busca: string;
  setBusca: (valor: string) => void;
  possuiFiltro: boolean;
  limparFiltros: () => void;
}

export default function ParcelasFiltro({ busca, setBusca, possuiFiltro, limparFiltros }: Props) {
  return <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="relative w-full sm:max-w-xl">
      <Search size={18} className="absolute left-3 top-3 text-zinc-500" />
      <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente, telefone, produto, modelo, IMEI ou cor..." className="h-11 pl-10" />
    </div>
    {possuiFiltro && <Button variant="outline" onClick={limparFiltros}><X size={16} /> Limpar filtros</Button>}
  </div>;
}
