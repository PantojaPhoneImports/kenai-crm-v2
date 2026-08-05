"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { listarVendas } from "@/services/vendas";
import { usuarioEhSocio } from "@/lib/socio";

export default function VendasTable() {
  const { usuario } = useAuth();

  const [vendas, setVendas] = useState<any[]>([]);

  useEffect(() => {
    if (usuario) {
      carregarVendas();
    }
  }, [usuario]);

  async function carregarVendas() {
    const vendasVisiveis = await listarVendas(usuarioEhSocio(usuario) ? usuario?.socioId : undefined);

    console.info("[vendas] usuario.socioId antes do filtro", usuario?.socioId);
    console.info("[vendas] vendas retornadas pela consulta", vendasVisiveis.map(({ id, produtoNome, socioId, status }) => ({ id, produtoNome, socioId, status })));

    setVendas(vendasVisiveis);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <table className="mobile-card-table w-full">
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
              <td data-label="Cliente" className="p-4 text-white">
                {venda.clienteNome}
              </td>

              <td data-label="Produto" className="p-4 text-zinc-300">
                {venda.produtoNome}
              </td>

              <td data-label="Valor" className="p-4 text-center text-green-400">
                R$ {Number(venda.valorProduto).toFixed(2)}
              </td>

              <td data-label="Entrada" className="p-4 text-center">
                R$ {Number(venda.entrada).toFixed(2)}
              </td>

              <td data-label="Parcelas" className="p-4 text-center">
                {venda.parcelas}x
              </td>

              <td data-label="Status" className="p-4 text-center">
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
