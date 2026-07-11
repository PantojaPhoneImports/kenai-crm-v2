"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  busca: string;
  setBusca: (valor: string) => void;
}

export default function ParcelasFiltro({
  busca,
  setBusca,
}: Props) {

  return (

    <div className="flex items-center justify-between">

      <div className="relative w-[420px]">

        <Search
          size={18}
          className="absolute left-3 top-3 text-zinc-500"
        />

        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar cliente ou produto..."
          className="pl-10 h-11"
        />

      </div>

    </div>

  );

}