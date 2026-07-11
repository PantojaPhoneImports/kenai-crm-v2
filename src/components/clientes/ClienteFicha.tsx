"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import { listarClientes } from "../../services/clientes";

import { listarVendas } from "../../services/vendas";

import { listarParcelas } from "../../services/parcelas";

import UploadContrato from "../contratos/UploadContrato";

export default function ClienteFicha() {

  const params = useParams();

  const [cliente, setCliente] = useState<any>(null);

  const [vendas, setVendas] = useState<any[]>([]);

  const [parcelas, setParcelas] = useState<any[]>([]);

  useEffect(() => {

    carregar();

  }, []);

  async function carregar() {

    const clientes = await listarClientes();

    const clienteEncontrado = clientes.find(

      (c: any) => c.id === params.id

    );

    if (!clienteEncontrado) return;

    setCliente(clienteEncontrado);

    const listaVendas = await listarVendas();

    const vendasCliente = listaVendas.filter(

      (v: any) =>

        v.clienteNome === clienteEncontrado.nome

    );

    setVendas(vendasCliente);

    const listaParcelas = await listarParcelas();

    const parcelasCliente = listaParcelas.filter(

      (p: any) =>

        p.clienteNome === clienteEncontrado.nome

    );

    setParcelas(parcelasCliente);

  }

  if (!cliente) {

    return (

      <p className="text-white">

        Carregando...

      </p>

    );

  }

  const totalCompra = vendas.reduce(

    (acc: number, venda: any) =>

      acc + Number(venda.valorProduto || 0),

    0

  );

  const totalEntrada = vendas.reduce(

    (acc: number, venda: any) =>

      acc + Number(venda.entrada || 0),

    0

  );

  const totalPago = parcelas

    .filter(

      (p: any) =>

        p.status === "PAGA"

    )

    .reduce(

      (acc: number, p: any) =>

        acc + Number(p.valor),

      0

    );

  const saldo =

    totalCompra -

    totalEntrada -

    totalPago;

  return (

    <div className="space-y-8">

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">

        <h1 className="text-3xl font-bold text-white">

          {cliente.nome}

        </h1>

        <div className="grid grid-cols-2 gap-6 mt-6">

          <div>

            <p className="text-zinc-400">

              CPF

            </p>

            <p className="text-white">

              {cliente.cpf}

            </p>

          </div>

          <div>

            <p className="text-zinc-400">

              Telefone

            </p>

            <p className="text-white">

              {cliente.telefone}

            </p>

          </div>

          <div>

            <p className="text-zinc-400">

              Profissão

            </p>

            <p className="text-white">

              {cliente.profissao}

            </p>

          </div>

          <div>

            <p className="text-zinc-400">

              E-mail

            </p>

            <p className="text-white">

              {cliente.email}

            </p>

          </div>

        </div>

      </div>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

          <p className="text-zinc-400">

            Total Comprado

          </p>

          <h2 className="text-2xl font-bold text-green-400 mt-2">

            R$ {totalCompra.toLocaleString(

              "pt-BR",

              {

                minimumFractionDigits: 2,

              }

            )}

          </h2>

        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

          <p className="text-zinc-400">

            Entrada

          </p>

          <h2 className="text-2xl font-bold text-blue-400 mt-2">

            R$ {totalEntrada.toLocaleString(

              "pt-BR",

              {

                minimumFractionDigits: 2,

              }

            )}

          </h2>

        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

          <p className="text-zinc-400">

            Valor Recebido

          </p>

          <h2 className="text-2xl font-bold text-yellow-400 mt-2">

            R$ {totalPago.toLocaleString(

              "pt-BR",

              {

                minimumFractionDigits: 2,

              }

            )}

          </h2>

        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">

          <p className="text-zinc-400">

            Saldo Devedor

          </p>

          <h2 className="text-2xl font-bold text-red-400 mt-2">

            R$ {saldo.toLocaleString(

              "pt-BR",

              {

                minimumFractionDigits: 2,

              }

            )}

          </h2>

        </div>

      </div>
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">

        <table className="w-full">

          <thead className="bg-zinc-800">

            <tr>

              <th className="p-4 text-left">

                Produto

              </th>

              <th className="p-4 text-center">

                Valor

              </th>

              <th className="p-4 text-center">

                Entrada

              </th>

              <th className="p-4 text-center">

                Parcelas

              </th>

            </tr>

          </thead>

          <tbody>

            {vendas.length === 0 ? (

              <tr>

                <td

                  colSpan={4}

                  className="text-center py-10 text-zinc-500"

                >

                  Nenhuma compra encontrada.

                </td>

              </tr>

            ) : (

              vendas.map((venda: any) => (

                <tr

                  key={venda.id}

                  className="border-t border-zinc-800"

                >

                  <td className="p-4">

                    {venda.produtoNome}

                  </td>

                  <td className="p-4 text-center text-green-400">

                    R$ {Number(venda.valorProduto).toLocaleString(

                      "pt-BR",

                      {

                        minimumFractionDigits: 2,

                      }

                    )}

                  </td>

                  <td className="p-4 text-center">

                    R$ {Number(venda.entrada).toLocaleString(

                      "pt-BR",

                      {

                        minimumFractionDigits: 2,

                      }

                    )}

                  </td>

                  <td className="p-4 text-center">

                    {venda.parcelas}x

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      <UploadContrato
  clienteId={cliente.id}
  socioId={cliente.socioId || ""}
/>

    </div>

  );

}