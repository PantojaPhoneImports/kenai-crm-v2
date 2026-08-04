"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";

import {
  listarProdutos,
  excluirProduto,
} from "@/services/estoque";

import { Produto } from "@/types/produto";
import { filtrarPorSocio, usuarioEhSocio } from "@/lib/socio";

export default function EstoqueTable() {
  const { usuario } = useAuth();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtro, setFiltro] = useState<"TODOS" | "DISPONIVEL" | "VENDIDO" | "DIOGO" | "ANTONIO">("TODOS");

  useEffect(() => {
    if (usuario) {
      carregarProdutos();
    }
  }, [usuario]);

  async function carregarProdutos() {

    const dados = await listarProdutos();
    setProdutos(filtrarPorSocio(dados, usuario));

}

  async function apagar(id: string) {
    const confirmar = confirm(
      "Deseja realmente excluir este produto?"
    );

    if (!confirmar) return;

    await excluirProduto(id);

    carregarProdutos();
  }

  const resumo = useMemo(() => ({
    total: produtos.length,
    disponiveis: produtos.filter((produto) => produto.status === "DISPONIVEL").length,
    vendidos: produtos.filter((produto) => produto.status === "VENDIDO").length,
    investido: produtos.reduce((total, produto) => total + Number(produto.custo || 0), 0),
    valorEstoque: produtos.reduce((total, produto) => total + Number(produto.venda || 0), 0),
  }), [produtos]);
  const produtosFiltrados = useMemo(() => produtos.filter((produto) => {
    if (filtro === "DISPONIVEL" || filtro === "VENDIDO") return produto.status === filtro;
    if (filtro === "DIOGO") return produto.socioNome?.toLowerCase().includes("diogo");
    if (filtro === "ANTONIO") return produto.socioNome?.toLowerCase().includes("antonio");
    return true;
  }), [produtos, filtro]);
  const ehSocio = usuarioEhSocio(usuario);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[["Total aparelhos", resumo.total], ["Disponíveis", resumo.disponiveis], ["Vendidos", resumo.vendidos], ["Valor investido", resumo.investido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })], ["Valor em estoque", resumo.valorEstoque.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })]].map(([titulo, valor]) => <div key={String(titulo)} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"><p className="text-xs text-zinc-400">{titulo}</p><p className="mt-1 text-lg font-bold text-white">{valor}</p></div>)}
      </div>
      <div className="flex flex-wrap gap-2">
        {(ehSocio ? [['TODOS','Todos'],['DISPONIVEL','Disponíveis'],['VENDIDO','Vendidos']] : [['TODOS','Todos'],['DISPONIVEL','Disponíveis'],['VENDIDO','Vendidos'],['DIOGO','Diogo'],['ANTONIO','Antônio']]).map(([valor, titulo]) => <button key={valor} onClick={() => setFiltro(valor as typeof filtro)} className={`rounded-lg px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${filtro === valor ? "bg-amber-500 text-zinc-950 shadow-amber-500/20 hover:bg-amber-400" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>{titulo}</button>)}
      </div>
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      <table className="mobile-card-table w-full">
        <thead className="bg-zinc-800">
          <tr>
            <th className="p-4 text-left text-zinc-300">Produto</th>
            <th className="p-4 text-left text-zinc-300">Marca</th>
            <th className="p-4 text-left text-zinc-300">Modelo</th>
            <th className="p-4 text-left text-zinc-300">IMEI</th>
            <th className="p-4 text-left text-zinc-300">Venda</th>
            <th className="p-4 text-left text-zinc-300">Responsável</th>
            <th className="p-4 text-center text-zinc-300">Status</th>
            <th className="p-4 text-center text-zinc-300">Ações</th>
          </tr>
        </thead>

        <tbody>
          {produtosFiltrados.map((produto) => (
            <tr
              key={produto.id}
              className="border-t border-zinc-800 hover:bg-zinc-800/40 transition"
            >
              <td data-label="Produto" className="p-4 text-white font-medium">
                {produto.nome}
              </td>

              <td data-label="Marca" className="p-4 text-zinc-400">
                {produto.marca}
              </td>

              <td data-label="Modelo" className="p-4 text-zinc-400">
                {produto.modelo}
              </td>

              <td data-label="IMEI" className="p-4 text-zinc-400">
                {produto.imei}
              </td>

              <td data-label="Venda" className="p-4 text-green-400 font-semibold">
                R$ {Number(produto.venda).toFixed(2)}
              </td>

              <td data-label="Responsável" className="p-4">
                {produto.socioNome ? (
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    produto.socioNome.toLowerCase().includes("diogo")
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "bg-violet-500/20 text-violet-300"
                  }`}>
                    <span className="size-2 rounded-full bg-current" />
                    {ehSocio && produto.socioId === usuario?.socioId ? "Você" : produto.socioNome}
                  </span>
                ) : (
                  <span className="text-zinc-500">
                    Empresa
                  </span>
                )}
              </td>

              <td data-label="Status" className="p-4 text-center">
                {produto.status === "DISPONIVEL" && (
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                    Disponível
                  </span>
                )}

                {produto.status === "VENDIDO" && (
                  <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
                    Vendido
                  </span>
                )}

                {produto.status === "RESERVADO" && (
                  <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
                    Reservado
                  </span>
                )}

                {produto.status === "MANUTENCAO" && (
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
                    Manutenção
                  </span>
                )}
              </td>

              <td data-label="Ações" className="p-4">
                <div className="mobile-actions flex w-full flex-wrap justify-end gap-2">
                  <Link href={`/estoque/${produto.id}`}>
                    <button className="min-h-11 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition">
                      Editar
                    </button>
                  </Link>

                  {produto.status === "DISPONIVEL" && (
                    <Link href="/vendas/nova">
                      <button className="min-h-11 px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm">
                        Vender
                      </button>
                    </Link>
                  )}

                  <button
                    onClick={() => apagar(produto.id!)}
                    className="min-h-11 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}
