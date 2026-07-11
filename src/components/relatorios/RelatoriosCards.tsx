"use client";

import { useEffect, useState } from "react";

import { listarClientes } from "@/services/clientes";
import { listarProdutos } from "@/services/estoque";
import { listarVendas } from "@/services/vendas";
import { listarParcelas } from "@/services/parcelas";

export default function RelatoriosCards() {

  const [clientes, setClientes] = useState(0);
  const [estoque, setEstoque] = useState(0);
  const [vendas, setVendas] = useState(0);
  const [receber, setReceber] = useState(0);
  const [recebido, setRecebido] = useState(0);
  const [faturado, setFaturado] = useState(0);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {

    const listaClientes = await listarClientes();
    const listaProdutos = await listarProdutos();
    const listaVendas = await listarVendas();
    const listaParcelas = await listarParcelas();

    setClientes(listaClientes.length);

    setEstoque(
      listaProdutos.filter(
        (p: any) => p.status === "DISPONIVEL"
      ).length
    );

    setVendas(listaVendas.length);

    const totalReceber = listaParcelas
      .filter((p: any) => p.status !== "PAGA")
      .reduce(
        (acc: number, p: any) =>
          acc + Number(p.valor),
        0
      );

    setReceber(totalReceber);

    const totalRecebido = listaParcelas
      .filter((p: any) => p.status === "PAGA")
      .reduce(
        (acc: number, p: any) =>
          acc + Number(p.valor),
        0
      );

    setRecebido(totalRecebido);

    const totalFaturado = listaVendas.reduce(
      (acc: number, venda: any) =>
        acc + Number(venda.valorProduto),
      0
    );

    setFaturado(totalFaturado);

  }
    return (

    <div className="grid grid-cols-3 gap-6">

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">

        <p className="text-zinc-400">
          Clientes
        </p>

        <h2 className="text-3xl font-bold text-white mt-2">
          {clientes}
        </h2>

      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">

        <p className="text-zinc-400">
          Produtos em Estoque
        </p>

        <h2 className="text-3xl font-bold text-white mt-2">
          {estoque}
        </h2>

      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">

        <p className="text-zinc-400">
          Vendas
        </p>

        <h2 className="text-3xl font-bold text-white mt-2">
          {vendas}
        </h2>

      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">

        <p className="text-zinc-400">
          Contas a Receber
        </p>

        <h2 className="text-3xl font-bold text-yellow-400 mt-2">
          R$ {receber.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </h2>

      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">

        <p className="text-zinc-400">
          Valor Recebido
        </p>

        <h2 className="text-3xl font-bold text-green-400 mt-2">
          R$ {recebido.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </h2>

      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">

        <p className="text-zinc-400">
          Faturamento
        </p>

        <h2 className="text-3xl font-bold text-blue-400 mt-2">
          R$ {faturado.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </h2>

      </div>

    </div>

  );

}