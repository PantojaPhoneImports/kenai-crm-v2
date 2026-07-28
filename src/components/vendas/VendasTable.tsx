"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";

import { listarVendas } from "@/services/vendas";

export default function VendasTable() {
  const { usuario } = useAuth();

  const [vendas, setVendas] = useState<any[]>([]);

  useEffect(() => {
    if (usuario) {
      carregarVendas();
    }
  }, [usuario]);

  async function carregarVendas() {
    let lista = await listarVendas();

    console.log("USUARIO:", usuario);
    console.log("SOCIO:", usuario?.socioId);

    if (usuario?.perfil === "SOCIO") {
      lista = lista.filter((venda: any) => {
        console.log(
          venda.produtoNome,
          venda.socioId,
          usuario?.socioId
        );

        return venda.socioId === usuario?.socioId;
      });
    }

    console.log("TOTAL VENDAS:", lista.length);

    setVendas(lista);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-zinc-800">
          <tr>
            <th className="p-4 text-left text-zinc-300">
              Cliente
            </th>

            <th className="p-4 text-left text-zinc-300">
              Produto
            </th>

            <th className="p-4 text-center text-zinc-300">
              Valor
            </th>

            <th className="p-4 text-center text-zinc-300">
              Entrada
            </th>

            <th className="p-4 text-center text-zinc-300">
              Parcelas
            </th>

            <th className="p-4 text-center text-zinc-300">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {vendas.map((venda) => (
            <tr
              key={venda.id}
              className="border-t border-zinc-800 hover:bg-zinc-800/40 transition"
            >
              <td className="p-4 text-white">
                {venda.clienteNome}
              </td>

              <td className="p-4 text-zinc-300">
                {venda.produtoNome}
              </td>

              <td className="p-4 text-center text-green-400">
                R$ {Number(venda.valorProduto).toFixed(2)}
              </td>

              <td className="p-4 text-center">
                R$ {Number(venda.entrada).toFixed(2)}
              </td>

              <td className="p-4 text-center">
                {venda.parcelas}x
              </td>

              <td className="p-4 text-center">
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                  {venda.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}