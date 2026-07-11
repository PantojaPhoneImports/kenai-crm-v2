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

export default function PerfilSocio({
  id,
}: Props) {

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

    const vendasSocio = vendasLista.filter(

      (venda: any) =>

        produtosSocio.some(

          (produto: any) =>

            produto.id === venda.produtoId

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

      <p className="text-white">

        Carregando...

      </p>

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

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <DollarSign
            className="text-green-400 mb-4"
            size={30}
          />

          <p className="text-zinc-400 text-sm">

            Capital Investido

          </p>

          <h2 className="text-3xl font-bold text-white mt-2">

            {capital.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}

          </h2>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <Smartphone
            className="text-blue-400 mb-4"
            size={30}
          />

          <p className="text-zinc-400 text-sm">

            Celulares

          </p>

          <h2 className="text-3xl font-bold text-white mt-2">

            {estoque}

          </h2>

        </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <Users
            className="text-purple-400 mb-4"
            size={30}
          />

          <p className="text-zinc-400 text-sm">

            Clientes

          </p>

          <h2 className="text-3xl font-bold text-white mt-2">

            {clientes}

          </h2>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <Wallet
            className="text-yellow-400 mb-4"
            size={30}
          />

          <p className="text-zinc-400 text-sm">

            Valor a Receber

          </p>

          <h2 className="text-3xl font-bold text-white mt-2">

            {receber.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}

          </h2>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <TrendingUp
            className="text-emerald-400 mb-4"
            size={30}
          />

          <p className="text-zinc-400 text-sm">

            Recebido

          </p>

          <h2 className="text-3xl font-bold text-white mt-2">

            {recebido.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}

          </h2>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <DollarSign
            className="text-cyan-400 mb-4"
            size={30}
          />

          <p className="text-zinc-400 text-sm">

            Lucro

          </p>

          <h2 className="text-3xl font-bold text-white mt-2">

            {lucro.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}

          </h2>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <ShoppingCart
            className="text-pink-400 mb-4"
            size={30}
          />

          <p className="text-zinc-400 text-sm">

            Vendas

          </p>

          <h2 className="text-3xl font-bold text-white mt-2">

            {vendas}

          </h2>

        </div>

      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

        <h2 className="text-2xl font-bold text-white">

          Dados do Sócio

        </h2>

        <div className="grid grid-cols-2 gap-6 mt-8">
                      <div>

            <p className="text-zinc-500">

              Nome

            </p>

            <p className="text-white font-semibold">

              {socio.nome}

            </p>

          </div>

          <div>

            <p className="text-zinc-500">

              E-mail

            </p>

            <p className="text-white font-semibold">

              {socio.email}

            </p>

          </div>

          <div>

            <p className="text-zinc-500">

              Telefone

            </p>

            <p className="text-white font-semibold">

              {socio.telefone}

            </p>

          </div>

          <div>

            <p className="text-zinc-500">

              Percentual

            </p>

            <p className="text-white font-semibold">

              {socio.percentual}%

            </p>

          </div>

          <div>

            <p className="text-zinc-500">

              PIX

            </p>

            <p className="text-white font-semibold">

              {socio.pix || "-"}

            </p>

          </div>

          <div>

            <p className="text-zinc-500">

              Status

            </p>

            <p
              className={`font-semibold ${
                socio.status === "ATIVO"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >

              {socio.status}

            </p>

          </div>

        </div>

      </div>

    </div>

  );

}
        