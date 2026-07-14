"use client";

import { useEffect, useState } from "react";

import {
  Users,
  Smartphone,
  DollarSign,
  Wallet,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";

import { buscarSocio } from "@/services/socios";
import { listarProdutos } from "@/services/estoque";
import { listarVendas } from "@/services/vendas";
import { listarParcelas } from "@/services/parcelas";
import { listarClientes } from "@/services/clientes";

interface Props {
  id: string;
}

export default function PerfilSocio({ id }: Props) {

  const [socio, setSocio] = useState<any>(null);

  const [capital, setCapital] = useState(0);
  const [estoque, setEstoque] = useState(0);
  const [clientes, setClientes] = useState(0);
  const [receber, setReceber] = useState(0);
  const [recebido, setRecebido] = useState(0);
  const [lucro, setLucro] = useState(0);
  const [vendas, setVendas] = useState(0);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {

    const dados = await buscarSocio(id);

    if (!dados) return;

    setSocio(dados);

    const produtos = await listarProdutos();
    const vendasLista = await listarVendas();
    const parcelas = await listarParcelas();
    await listarClientes();

    const produtosSocio = produtos.filter(
      (produto: any) => produto.socioId === id
    );

    setEstoque(produtosSocio.length);

    const capitalInvestido = produtosSocio.reduce(
      (total: number, produto: any) =>
        total + Number(produto.custo || 0),
      0
    );

    setCapital(capitalInvestido);

    const vendasSocio = vendasLista.filter((venda: any) =>
      produtosSocio.some(
        (produto: any) => produto.id === venda.produtoId
      )
    );

    setVendas(vendasSocio.length);

    const clientesUnicos = new Set(
      vendasSocio.map(
        (venda: any) => venda.clienteId
      )
    );

    setClientes(clientesUnicos.size);

    let totalRecebido = 0;
    let totalReceber = 0;

    parcelas.forEach((parcela: any) => {

      const pertenceAoSocio = vendasSocio.some(
        (venda: any) =>
          venda.clienteNome === parcela.clienteNome
      );

      if (!pertenceAoSocio) return;

      if (parcela.status === "PAGA") {

        totalRecebido += Number(parcela.valor);

      } else {

        totalReceber += Number(parcela.valor);

      }

    });

    setRecebido(totalRecebido);
    setReceber(totalReceber);

    setLucro(totalRecebido - capitalInvestido);

  }

  if (!socio) {

    return (
      <div className="text-white text-xl">
        Carregando...
      </div>
    );

  }

  return (

    <div className="space-y-8">

      <div>

        <h1 className="text-4xl font-bold text-white">
          {socio.nome}
        </h1>

        <p className="text-zinc-400 mt-2">
          Perfil Financeiro do Sócio
        </p>

      </div>

      <div className="grid grid-cols-4 gap-6">

        <Card
          titulo="Capital Investido"
          valor={capital.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          icone={<DollarSign className="text-green-400" size={30} />}
        />

        <Card
          titulo="Celulares"
          valor={estoque}
          icone={<Smartphone className="text-blue-400" size={30} />}
        />

        <Card
          titulo="Clientes"
          valor={clientes}
          icone={<Users className="text-purple-400" size={30} />}
        />

        <Card
          titulo="Valor a Receber"
          valor={receber.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          icone={<Wallet className="text-yellow-400" size={30} />}
        />

        <Card
          titulo="Recebido"
          valor={recebido.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          icone={<TrendingUp className="text-emerald-400" size={30} />}
        />

        <Card
          titulo="Lucro"
          valor={lucro.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          icone={<DollarSign className="text-cyan-400" size={30} />}
        />

        <Card
          titulo="Vendas"
          valor={vendas}
          icone={<ShoppingCart className="text-pink-400" size={30} />}
        />

      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

        <h2 className="text-2xl font-bold text-white">
          Dados do Sócio
        </h2>

        <div className="grid grid-cols-2 gap-6 mt-8">

          <Campo titulo="Nome" valor={socio.nome} />
          <Campo titulo="E-mail" valor={socio.email} />
          <Campo titulo="Telefone" valor={socio.telefone} />
          <Campo titulo="Percentual" valor={`${socio.percentual}%`} />
          <Campo titulo="PIX" valor={socio.pix || "-"} />
          <Campo titulo="Status" valor={socio.status} />

        </div>

      </div>

    </div>

  );

}

function Card({
  titulo,
  valor,
  icone,
}: any) {

  return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

      <div className="mb-4">
        {icone}
      </div>

      <p className="text-zinc-400 text-sm">
        {titulo}
      </p>

      <h2 className="text-3xl font-bold text-white mt-2">
        {valor}
      </h2>

    </div>

  );

}

function Campo({
  titulo,
  valor,
}: any) {

  return (

    <div>

      <p className="text-zinc-500">
        {titulo}
      </p>

      <p className="text-white font-semibold">
        {valor}
      </p>

    </div>

  );

}