"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useParams } from "next/navigation";

import {

  Smartphone,

  DollarSign,

  User,

  Building,

  Package,

  Pencil,

} from "lucide-react";

import { listarProdutos } from "../../services/estoque";

import { listarVendas } from "../../services/vendas";

export default function ProdutoFicha() {

  const params = useParams();

  const [produto, setProduto] = useState<any>(null);

  const [venda, setVenda] = useState<any>(null);

  useEffect(() => {

    carregar();

  }, []);

  async function carregar() {

    const produtos = await listarProdutos();

    const encontrado = produtos.find(

      (p: any) =>

        p.id === params.id

    );

    if (!encontrado) return;

    setProduto(encontrado);

    const vendas = await listarVendas();

    const vendaProduto = vendas.find(

      (v: any) =>

        v.produtoNome === encontrado.nome

    );

    if (vendaProduto) {

      setVenda(vendaProduto);

    }

  }

  if (!produto) {

    return (

      <p className="text-white">

        Carregando...

      </p>

    );

  }

  const lucro =

    Number(produto.venda || 0) -

    Number(produto.custo || 0);

  return (

    <div className="space-y-8">

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

        <div className="flex justify-between items-center">

          <div>

            <h1 className="text-3xl font-bold text-white">

              {produto.nome}

            </h1>

            <p className="text-zinc-400 mt-2">

              Perfil completo do aparelho.

            </p>

          </div>

          <Link

            href={`/estoque/${produto.id}`}

          >

            <button className="bg-blue-600 hover:bg-blue-700 transition rounded-xl px-5 py-3 flex items-center gap-2">

              <Pencil size={18} />

              Editar

            </button>

          </Link>

        </div>

      </div>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

          <Smartphone

            className="text-blue-400"

            size={26}

          />

          <p className="text-zinc-400 mt-3">

            Marca

          </p>

          <h3 className="text-white font-bold text-xl">

            {produto.marca}

          </h3>

        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

          <Package

            className="text-yellow-400"

            size={26}

          />

          <p className="text-zinc-400 mt-3">

            Modelo

          </p>

          <h3 className="text-white font-bold text-xl">

            {produto.modelo}

          </h3>

        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

          <Building

            className="text-green-400"

            size={26}

          />

          <p className="text-zinc-400 mt-3">

            Fornecedor

          </p>

          <h3 className="text-white font-bold text-xl">

            {produto.fornecedor}

          </h3>

        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

          <User

            className="text-violet-400"

            size={26}

          />

          <p className="text-zinc-400 mt-3">

            Sócio

          </p>

          <h3 className="text-white font-bold text-xl">

            {produto.socioNome || "-"}

          </h3>

        </div>

      </div>

      <div className="grid grid-cols-2 gap-6">

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">

          <h2 className="text-2xl font-bold text-white mb-6">

            Informações

          </h2>

          <div className="space-y-4">

            <div className="flex justify-between">

              <span className="text-zinc-400">

                IMEI

              </span>

              <span className="text-white">

                {produto.imei}

              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-zinc-400">

                Cor

              </span>

              <span className="text-white">

                {produto.cor}

              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-zinc-400">

                Capacidade

              </span>

              <span className="text-white">

                {produto.capacidade}

              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-zinc-400">

                Status

              </span>

              <span

                className={`font-bold ${
                  produto.status === "VENDIDO"

                    ? "text-red-400"

                    : "text-green-400"

                }`}

              >

                {produto.status}

              </span>

            </div>

          </div>

        </div>
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">

          <h2 className="text-2xl font-bold text-white mb-6">

            Financeiro

          </h2>

          <div className="space-y-4">

            <div className="flex justify-between">

              <span className="text-zinc-400">

                Valor de Compra

              </span>

              <span className="text-yellow-400 font-semibold">

                {Number(produto.custo).toLocaleString(

                  "pt-BR",

                  {

                    style: "currency",

                    currency: "BRL",

                  }

                )}

              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-zinc-400">

                Valor de Venda

              </span>

              <span className="text-green-400 font-semibold">

                {Number(produto.venda).toLocaleString(

                  "pt-BR",

                  {

                    style: "currency",

                    currency: "BRL",

                  }

                )}

              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-zinc-400">

                Lucro Estimado

              </span>

              <span className="text-blue-400 font-bold">

                {lucro.toLocaleString(

                  "pt-BR",

                  {

                    style: "currency",

                    currency: "BRL",

                  }

                )}

              </span>

            </div>

          </div>

        </div>

      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

        <h2 className="text-2xl font-bold text-white mb-6">

          Histórico da Venda

        </h2>

        {venda ? (

          <div className="grid grid-cols-2 gap-6">

            <div>

              <p className="text-zinc-400">

                Cliente

              </p>

              <p className="text-white font-semibold">

                {venda.clienteNome}

              </p>

            </div>

            <div>

              <p className="text-zinc-400">

                Entrada

              </p>

              <p className="text-white font-semibold">

                {Number(venda.entrada).toLocaleString(

                  "pt-BR",

                  {

                    style: "currency",

                    currency: "BRL",

                  }

                )}

              </p>

            </div>

            <div>

              <p className="text-zinc-400">

                Parcelamento

              </p>

              <p className="text-white font-semibold">

                {venda.parcelas}x

              </p>

            </div>

            <div>

              <p className="text-zinc-400">

                Valor da Venda

              </p>

              <p className="text-green-400 font-semibold">

                {Number(venda.valorProduto).toLocaleString(

                  "pt-BR",

                  {

                    style: "currency",

                    currency: "BRL",

                  }

                )}

              </p>

            </div>

          </div>

        ) : (

          <div className="text-center py-8 text-zinc-500">

            Este aparelho ainda não foi vendido.

          </div>

        )}

      </div>

    </div>

  );

}