"use client";

import { useMemo, useState } from "react";
import ClienteHeader from "./ClienteHeader";
import ClienteResumo from "./ClienteResumo";
import ClienteProgress from "./ClienteProgress";
import ParcelaItem from "./ParcelaItem";

interface Props { cliente: string; telefone?: string; parcelas: any[]; onExcluir: (id: string) => void; }

export default function ClienteCard({ cliente, telefone, parcelas, onExcluir }: Props) {
  const [aberto, setAberto] = useState(true);
  const resumo = useMemo(() => {
    let financiado = 0; let recebido = 0; let saldo = 0; let pagas = 0; let pendentes = 0; let proximo: Date | null = null;
    let alerta: "OK" | "3DIAS" | "HOJE" | "ATRASADO" = "OK";
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    parcelas.forEach((parcela) => {
      const valor = Number(parcela.valor || 0); financiado += valor;
      const vencimento = parcela.vencimento?.seconds ? new Date(parcela.vencimento.seconds * 1000) : new Date(parcela.vencimento);
      if (parcela.status === "PAGA") { recebido += valor; pagas++; return; }
      saldo += valor; pendentes++; if (!proximo || vencimento < proximo) proximo = vencimento;
      const dias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      if (dias < 0) alerta = "ATRASADO";
      else if (dias === 0 && alerta !== "ATRASADO") alerta = "HOJE";
      else if (dias <= 3 && alerta === "OK") alerta = "3DIAS";
    });
    return { financiado, recebido, saldo, pagas, pendentes, percentual: financiado ? Math.round((recebido / financiado) * 100) : 0, proximo, alerta: alerta as "OK" | "3DIAS" | "HOJE" | "ATRASADO" };
  }, [parcelas]);
  const corBorda = resumo.alerta === "ATRASADO" ? "border-red-500" : resumo.alerta === "HOJE" ? "border-yellow-500" : resumo.alerta === "3DIAS" ? "border-blue-500" : "border-zinc-800";
  const primeira = parcelas[0];

  return <div className={`overflow-hidden rounded-2xl border ${corBorda} bg-zinc-900`}>
    <ClienteHeader aberto={aberto} setAberto={setAberto} cliente={cliente} telefone={telefone} alerta={resumo.alerta} parcelas={parcelas} socioNome={primeira?.socioNome} produto={primeira?.produtoNome} restantes={resumo.pendentes} />
    <ClienteResumo financiado={resumo.financiado} recebido={resumo.recebido} saldo={resumo.saldo} proximo={resumo.proximo} />
    <ClienteProgress percentual={resumo.percentual} pagas={resumo.pagas} pendentes={resumo.pendentes} />
    {aberto && <div><div className="hidden grid-cols-6 gap-6 bg-zinc-800 px-6 py-4 text-sm font-semibold text-zinc-400 sm:grid"><div>Produto</div><div className="text-center">Parcela</div><div className="text-center">Vencimento</div><div className="text-center">Valor</div><div className="text-center">Status</div><div className="text-right">Ações</div></div>{parcelas.map((parcela) => <ParcelaItem key={parcela.id} parcela={parcela} onExcluir={onExcluir} />)}</div>}
  </div>;
}
