"use client";

import { useCallback, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { filtrarPorSocio, usuarioEhSocio } from "@/lib/socio";

import {
  DollarSign,
  Wallet,
  AlertTriangle,
  Smartphone,
  Users,
  ShoppingCart,
  PiggyBank,
  HandCoins,
  TrendingUp,
} from "lucide-react";

import { carregarDashboard } from "@/services/dashboard";

export default function DashboardCards() {

  const { usuario } = useAuth();

  const [dados, setDados] = useState({
    clientes: 0,
    estoque: 0,
    vendas: 0,
    socios: 0,
    parcelasPendentes: 0,
    valorInvestido: 0,
    valorEstoque: 0,
    faturamento: 0,
    lucro: 0,
  });

  const [quantidadeClientes, setQuantidadeClientes] = useState(0);
  const [estoquePorSocio, setEstoquePorSocio] = useState({ diogo: 0, antonio: 0 });
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!usuario) return;
    setErro(null);
    try {
      const dashboard = await carregarDashboard(usuario);
      setDados(dashboard);
    } catch (error) {
      const detalhe = error as { code?: string; message?: string; stack?: string };
      console.error("[dashboard] DashboardCards não recebeu dados", {
        code: detalhe.code,
        message: detalhe.message,
        stack: detalhe.stack,
        error,
      });
      setErro(detalhe.message || "Erro interno ao consultar os dados do Dashboard.");
    }
  }, [usuario]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    if (!usuario) return;
    if (usuarioEhSocio(usuario)) {
      setEstoquePorSocio({ diogo: 0, antonio: 0 });
      return;
    }

    const inicio = performance.now();
    console.info("[dashboard] início da assinatura", { colecao: "estoque" });
    return onSnapshot(collection(db, "estoque"), (snapshot) => {
      // Mantém exatamente o mesmo critério da tela Estoque: todos os produtos
      // visíveis ao usuário autenticado, sem restringir pelo status do aparelho.
      const produtos = filtrarPorSocio(
        snapshot.docs.map((documento) => ({ id: documento.id, ...documento.data() })),
        usuario
      );

      setEstoquePorSocio({
        diogo: produtos.filter((produto: any) =>
          String(produto.socioNome || "").toLowerCase().includes("diogo")
        ).length,
        antonio: produtos.filter((produto: any) =>
          String(produto.socioNome || "").toLowerCase().includes("antonio")
        ).length,
      });
      console.info("[dashboard] resultado da assinatura", { colecao: "estoque", documentos: snapshot.size, tempoMs: Math.round(performance.now() - inicio) });
    }, (error) => {
      const detalhe = error as { code?: string; message?: string; stack?: string };
      console.error("[dashboard] erro na assinatura", { colecao: "estoque", tempoMs: Math.round(performance.now() - inicio), code: detalhe.code, message: detalhe.message, stack: detalhe.stack, error });
    });
  }, [usuario]);

  useEffect(() => {
    if (!usuario || usuarioEhSocio(usuario)) {
      setQuantidadeClientes(0);
      return;
    }

    const inicio = performance.now();
    console.info("[dashboard] início da assinatura", { colecao: "clientes" });
    const cancelarAssinatura = onSnapshot(
      collection(db, "clientes"),
      (snapshot) => {
        const clientes = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        setQuantidadeClientes(filtrarPorSocio(clientes, usuario).length);
        console.info("[dashboard] resultado da assinatura", { colecao: "clientes", documentos: snapshot.size, tempoMs: Math.round(performance.now() - inicio) });
      },
      (error) => {
        const detalhe = error as { code?: string; message?: string; stack?: string };
        console.error("[dashboard] erro na assinatura", { colecao: "clientes", tempoMs: Math.round(performance.now() - inicio), code: detalhe.code, message: detalhe.message, stack: detalhe.stack, error });
      }
    );

    return cancelarAssinatura;
  }, [usuario]);

  const cards = usuarioEhSocio(usuario) ? [
    { titulo: "Meu estoque", valor: dados.estoque.toString(), icone: Smartphone },
    { titulo: "Meu investimento", valor: `R$ ${dados.valorInvestido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icone: PiggyBank },
    { titulo: "Minhas vendas", valor: dados.vendas.toString(), icone: ShoppingCart },
    { titulo: "Meu lucro", valor: `R$ ${dados.lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icone: TrendingUp },
    { titulo: "Meu faturamento", valor: `R$ ${dados.faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icone: DollarSign },
  ] : [

    {
      titulo: "Valor Investido",
      valor: `R$ ${dados.valorInvestido.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      icone: PiggyBank,
    },

    {
      titulo: "Valor em Estoque",
      valor: `R$ ${dados.valorEstoque.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      icone: Wallet,
    },

    {
      titulo: "Faturamento",
      valor: `R$ ${dados.faturamento.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      icone: DollarSign,
    },

    {
      titulo: "Parcelas Pendentes",
      valor: dados.parcelasPendentes.toString(),
      icone: AlertTriangle,
    },

    {
      titulo: "Clientes",
      valor: quantidadeClientes.toString(),
      icone: Users,
    },

    {
      titulo: "Aparelhos em Estoque",
      valor: dados.estoque.toString(),
      icone: Smartphone,
    },

    {
      titulo: "Sócios",
      valor: dados.socios.toString(),
      icone: HandCoins,
    },

    {
      titulo: "Vendas",
      valor: dados.vendas.toString(),
      icone: ShoppingCart,
    },

    { titulo: "Aparelhos do Diogo", valor: estoquePorSocio.diogo.toString(), icone: Smartphone },
    { titulo: "Aparelhos do Antonio", valor: estoquePorSocio.antonio.toString(), icone: Smartphone },

  ];

  return (
    <>
      {erro && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">Erro ao carregar Dashboard: {erro}. Consulte o console para o diagnóstico completo.</div>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">

      {cards.map((card) => {

        const Icon = card.icone;

        return (

          <div
            key={card.titulo}
            className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/70 hover:shadow-amber-500/10"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-zinc-400 text-sm">
                  {card.titulo}
                </p>

                <h2 className="text-2xl font-bold text-white mt-2">
                  {card.valor}
                </h2>

              </div>

              <div className="bg-amber-500 rounded-xl p-3 shadow-lg shadow-amber-500/20">

                <Icon
                  size={24}
                  className="text-white"
                />

              </div>

            </div>

          </div>

        );

      })}

      </div>
    </>

  );

}
