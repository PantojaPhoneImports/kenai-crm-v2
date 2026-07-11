"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {

    carregar();

  }, []);

  async function carregar() {

    const dashboard = await carregarDashboard();

    setDados(dashboard);

  }

  const cards = [

    {

      titulo: "Valor Investido",

      valor: `R$ ${dados.valorInvestido.toLocaleString("pt-BR",{

        minimumFractionDigits:2,

      })}`,

      icone: PiggyBank,

    },

    {

      titulo: "Valor em Estoque",

      valor: `R$ ${dados.valorEstoque.toLocaleString("pt-BR",{

        minimumFractionDigits:2,

      })}`,

      icone: Wallet,

    },

    {

      titulo: "Faturamento",

      valor: `R$ ${dados.faturamento.toLocaleString("pt-BR",{

        minimumFractionDigits:2,

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

      valor: dados.clientes.toString(),

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

  ];

  return (

    <div className="grid grid-cols-4 gap-6">

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