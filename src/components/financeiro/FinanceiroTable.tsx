"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { listarParcelas, receberParcela } from "@/services/parcelas";
import { listarVendas } from "@/services/vendas";
import { calcularFinanceiroPago } from "@/services/calculosFinanceiros";
import { usuarioEhSocio } from "@/lib/socio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReceberModal from "./ReceberModal";

const moeda = (valor: number) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

function data(valor: any) {
  const date = valor?.seconds ? new Date(valor.seconds * 1000) : new Date(valor);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("pt-BR");
}

export default function FinanceiroTable() {
  const { usuario } = useAuth();
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [vendas, setVendas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const [parcelaSelecionada, setParcelaSelecionada] = useState<any>(null);

  useEffect(() => {
    if (usuario) carregar();
  }, [usuario]);

  async function carregar() {
    const socioId = usuarioEhSocio(usuario) ? usuario?.socioId : undefined;
    const [todasParcelas, todasVendas] = await Promise.all([listarParcelas(socioId), listarVendas(socioId)]);
    setParcelas(todasParcelas);
    setVendas(todasVendas);
  }

  async function confirmarRecebimento(formaPagamento: string, dataPagamento: string, observacao: string) {
    if (!parcelaSelecionada) return;
    await receberParcela(parcelaSelecionada.id, formaPagamento, dataPagamento, observacao);
    setParcelaSelecionada(null);
    carregar();
  }

  const clientes = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const porVenda = new Map(vendas.map((venda) => [venda.id, venda]));
    const grupos = new Map<string, { id: string; nome: string; vendas: any[] }>();

    parcelas.forEach((parcela) => {
      const venda = porVenda.get(parcela.vendaId);
      if (!venda) return;
      const corresponde = !termo || [parcela.clienteNome, parcela.produtoNome]
        .some((valor) => String(valor || "").toLowerCase().includes(termo));
      if (!corresponde) return;

      const chave = parcela.clienteId || parcela.clienteNome || "sem-cliente";
      const grupo: { id: string; nome: string; vendas: any[] } =
        grupos.get(chave) || { id: chave, nome: parcela.clienteNome || "Cliente", vendas: [] };
      let vendaComParcelas = grupo.vendas.find((item) => item.venda.id === venda.id);
      if (!vendaComParcelas) {
        vendaComParcelas = { venda, parcelas: [] };
        grupo.vendas.push(vendaComParcelas);
      }
      vendaComParcelas.parcelas.push(parcela);
      grupos.set(chave, grupo);
    });

    return [...grupos.values()].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [busca, parcelas, vendas]);

  return (
    <div className="space-y-5">
      <Input
        className="max-w-md"
        placeholder="Buscar cliente ou produto..."
        value={busca}
        onChange={(event) => setBusca(event.target.value)}
      />

      {clientes.map((cliente) => {
        const aberto = Boolean(abertos[cliente.id]);
        return (
          <section key={cliente.id} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <button
              type="button"
              className="flex min-h-20 w-full items-center justify-between p-4 text-left sm:p-6"
              onClick={() => setAbertos((atual) => ({ ...atual, [cliente.id]: !atual[cliente.id] }))}
            >
              <div>
                <h2 className="text-xl font-bold text-white">{cliente.nome}</h2>
                <p className="mt-1 text-sm text-zinc-400">{cliente.vendas.length} venda(s) vinculada(s)</p>
              </div>
              {aberto ? <ChevronDown className="text-zinc-400" /> : <ChevronRight className="text-zinc-400" />}
            </button>

            {aberto && (
              <div className="space-y-5 border-t border-zinc-800 p-4 sm:p-6">
                {cliente.vendas.map(({ venda, parcelas: parcelasVenda }: any) => {
                  const ordenadas = [...parcelasVenda].sort((a, b) => Number(a.parcela) - Number(b.parcela));
                  const calculo = calcularFinanceiroPago({
                    tipoSocio: venda.tipoSocio,
                    capitalInvestido: Number(venda.capitalSocio || 0),
                    entrada: Number(venda.entrada || 0),
                    valorVenda: Number(venda.valorProduto || 0),
                    custoProduto: Number(venda.custoProduto || 0),
                    parcelas: Number(venda.parcelas || ordenadas.length || 1),
                  }, ordenadas.filter((parcela) => parcela.status === "PAGA").length);

                  return (
                    <article key={venda.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
                      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{venda.produtoNome}</h3>
                          <p className="text-sm text-zinc-400">Status da venda: {venda.status}</p>
                        </div>
                        <span className="rounded-full bg-green-500/15 px-3 py-1 text-sm font-semibold text-green-400">{venda.status}</span>
                      </div>

                      <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <Resumo titulo="Valor da venda" valor={moeda(venda.valorProduto)} />
                        <Resumo titulo="Entrada" valor={moeda(venda.entrada)} />
                        <Resumo titulo="Capital investido" valor={moeda(calculo.capitalInvestido)} />
                        <Resumo titulo="Capital recuperado" valor={moeda(calculo.capitalRecuperado)} />
                        <Resumo titulo="Capital restante" valor={moeda(calculo.capitalRestante)} />
                        <Resumo titulo={calculo.tipoSocio === "PARCEIRO" ? "Seu lucro recebido" : "Lucro recebido"} valor={moeda(calculo.lucroRecebido)} />
                        <Resumo titulo={calculo.tipoSocio === "PARCEIRO" ? "Seu lucro a receber" : "Lucro a receber"} valor={moeda(calculo.lucroReceber)} />
                        {calculo.tipoSocio === "PARCEIRO" && <Resumo titulo="Lucro Pantoja" valor={moeda(calculo.empresaRecebido)} />}
                      </div>

                      <div className="mt-6 space-y-3">
                        <h4 className="font-semibold text-white">Parcelas</h4>
                        {ordenadas.map((parcela) => (
                          <div key={parcela.id} className="grid gap-3 rounded-lg border border-zinc-800 p-4 text-sm sm:grid-cols-2 lg:grid-cols-6">
                            <div><p className="text-zinc-500">Parcela</p><p className="font-medium text-white">{parcela.parcela}/{parcela.totalParcelas}</p></div>
                            <div><p className="text-zinc-500">Valor / vencimento</p><p className="font-medium text-white">{moeda(parcela.valor)} · {data(parcela.vencimento)}</p></div>
                            <div><p className="text-zinc-500">Capital</p><p className="font-medium text-cyan-400">{moeda(calculo.capitalPorParcela)}</p></div>
                            <div><p className="text-zinc-500">{calculo.tipoSocio === "PARCEIRO" ? "Seu Lucro" : "Lucro"}</p><p className="font-medium text-green-400">{moeda(calculo.lucroSocioPorParcela)}</p></div>
                            {calculo.tipoSocio === "PARCEIRO" && <div><p className="text-zinc-500">Lucro Pantoja</p><p className="font-medium text-green-400">{moeda(calculo.empresaPorParcela)}</p></div>}
                            <div className="flex items-center justify-between gap-2"><span className={parcela.status === "PAGA" ? "font-bold text-green-400" : "font-bold text-yellow-400"}>{parcela.status}</span>{parcela.status !== "PAGA" && <Button size="sm" onClick={() => setParcelaSelecionada(parcela)}>Receber</Button>}</div>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {clientes.length === 0 && <p className="py-10 text-center text-zinc-500">Nenhuma venda encontrada.</p>}
      <ReceberModal open={Boolean(parcelaSelecionada)} onClose={() => setParcelaSelecionada(null)} onConfirm={confirmarRecebimento} />
    </div>
  );
}

function Resumo({ titulo, valor }: { titulo: string; valor: string }) {
  return <div className="rounded-lg bg-zinc-900 p-3"><p className="text-zinc-500">{titulo}</p><p className="mt-1 font-semibold text-white">{valor}</p></div>;
}
