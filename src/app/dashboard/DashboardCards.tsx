"use client";

import { useEffect, useState } from "react";

import {
  Users,
  Package,
  ShoppingCart,
  Wallet,
  TrendingUp,
  Smartphone,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

import { listarClientes } from "@/services/clientes";
import { listarProdutos } from "@/services/estoque";
import { listarVendas } from "@/services/vendas";
import { listarParcelas } from "@/services/parcelas";
import { filtrarPorSocio } from "@/lib/socio";

export default function DashboardCards() {

  const { usuario } = useAuth();

  const [clientes, setClientes] = useState(0);
  const [estoque, setEstoque] = useState(0);
  const [vendas, setVendas] = useState(0);
  const [receber, setReceber] = useState(0);

  useEffect(() => {

    if (!usuario) return;

    carregarDashboard();

  }, [usuario]);

  async function carregarDashboard() {
        const listaClientes = await listarClientes();
    const listaProdutos = await listarProdutos();
    const listaVendas = await listarVendas();
    const listaParcelas = await listarParcelas();
    const clientesFiltrados = filtrarPorSocio(listaClientes, usuario);
    const produtosFiltrados = filtrarPorSocio(listaProdutos, usuario);
    const vendasFiltradas = filtrarPorSocio(listaVendas, usuario);
    const parcelasFiltradas = filtrarPorSocio(listaParcelas, usuario);

    setClientes(clientesFiltrados.length);

    const disponiveis = produtosFiltrados.filter(
      (produto: any) => produto.status === "DISPONIVEL"
    ).length;

    setEstoque(disponiveis);

    setVendas(vendasFiltradas.length);

    const totalReceber = parcelasFiltradas
      .filter(
        (parcela: any) => parcela.status !== "PAGA"
      )
      .reduce(
        (acc: number, parcela: any) =>
          acc + Number(parcela.valor || 0),
        0
      );

    setReceber(totalReceber);

  }
    const cards = [

    {
      titulo: "Clientes",
      valor: clientes,
      cor: "text-cyan-400",
      bg: "bg-cyan-500/10",
      icon: <Users size={32} />,
    },

    {
      titulo: "Estoque",
      valor: estoque,
      cor: "text-green-400",
      bg: "bg-green-500/10",
      icon: <Package size={32} />,
    },

    {
      titulo: "Vendas",
      valor: vendas,
      cor: "text-yellow-400",
      bg: "bg-yellow-500/10",
      icon: <ShoppingCart size={32} />,
    },

    {
      titulo: "Contas a Receber",
      valor: `R$ ${receber.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      cor: "text-emerald-400",
      bg: "bg-emerald-500/10",
      icon: <Wallet size={32} />,
    },

    {
      titulo: "Lucro Estimado",
      valor: `R$ ${(receber * 0.30).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      cor: "text-purple-400",
      bg: "bg-purple-500/10",
      icon: <TrendingUp size={32} />,
    },

    {
      titulo: "Produtos Vendidos",
      valor: vendas,
      cor: "text-orange-400",
      bg: "bg-orange-500/10",
      icon: <Smartphone size={32} />,
    },

  ];

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

      {cards.map((card, index) => (

        <div
          key={index}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-blue-500 transition-all duration-300"
        >

          <div className="flex justify-between items-center">

            <div>

              <p className="text-zinc-400 text-sm">
                {card.titulo}
              </p>

              <h2 className={`text-3xl font-bold mt-2 ${card.cor}`}>
                {card.valor}
              </h2>

            </div>

            <div
              className={`${card.bg} ${card.cor} p-4 rounded-xl`}
            >
              {card.icon}
            </div>

          </div>

        </div>

      ))}

    </div>

  );

}
