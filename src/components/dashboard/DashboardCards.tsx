"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { filtrarPorSocio } from "@/lib/socio";

import {
  DollarSign,
  Wallet,
  AlertTriangle,
  Smartphone,
  Users,
  ShoppingCart,
  PiggyBank,
  HandCoins,
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
  });

  const [quantidadeClientes, setQuantidadeClientes] = useState(0);
  const [estoquePorSocio, setEstoquePorSocio] = useState({ diogo: 0, antonio: 0 });

  useEffect(() => {

    if (usuario) {
      carregar();
    }

  }, [usuario]);

  useEffect(() => {
    if (!usuario) return;

    return onSnapshot(collection(db, "estoque"), (snapshot) => {
      const disponiveis = filtrarPorSocio(
        snapshot.docs.map((documento) => ({ id: documento.id, ...documento.data() })),
        usuario
      ).filter((produto: any) => produto.status === "DISPONIVEL");

      setEstoquePorSocio({
        diogo: disponiveis.filter((produto: any) =>
          String(produto.socioNome || "").toLowerCase().includes("diogo")
        ).length,
        antonio: disponiveis.filter((produto: any) =>
          String(produto.socioNome || "").toLowerCase().includes("antonio")
        ).length,
      });
    }, (error) => console.error("Erro ao atualizar estoque por sócio:", error));
  }, [usuario]);

  useEffect(() => {
    if (!usuario) {
      setQuantidadeClientes(0);
      return;
    }

    const cancelarAssinatura = onSnapshot(
      collection(db, "clientes"),
      (snapshot) => {
        const clientes = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        setQuantidadeClientes(filtrarPorSocio(clientes, usuario).length);
      },
      (error) => {
        console.error("Erro ao atualizar a quantidade de clientes no Dashboard:", error);
      }
    );

    return cancelarAssinatura;
  }, [usuario]);

  async function carregar() {

    if (!usuario) return;

    const dashboard = await carregarDashboard(usuario);

    setDados(dashboard);

  }

  const cards = [

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

    ...(usuario?.perfil?.toUpperCase() === "SOCIO" ? [] : [
      {
        titulo: "Aparelhos do Diogo",
        valor: estoquePorSocio.diogo.toString(),
        icone: Smartphone,
      },
      {
        titulo: "Aparelhos do Antonio",
        valor: estoquePorSocio.antonio.toString(),
        icone: Smartphone,
      },
    ]),

  ];

  return (

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">

      {cards.map((card) => {

        const Icon = card.icone;

        return (

          <div
            key={card.titulo}
            className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 hover:border-blue-600 transition-all duration-300 hover:scale-[1.02]"
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

              <div className="bg-blue-600 rounded-xl p-3">

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

  );

}
