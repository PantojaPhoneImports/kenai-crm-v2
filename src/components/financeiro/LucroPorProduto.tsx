"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { usuarioEhSocio } from "@/lib/socio";

export default function LucroPorProduto() {
const { usuario } = useAuth();
  const [lista, setLista] =
    useState<any[]>([]);

  useEffect(() => {
    if (usuario) carregar();

  }, [usuario]);

  async function carregar() {

    const snapshot =
      await getDocs(
        usuarioEhSocio(usuario)
          ? query(collection(db, "repasses"), where("socioId", "==", usuario?.socioId))
          : collection(db, "repasses")
      );

    let dados = snapshot.docs.map((doc) => ({

  id: doc.id,

  ...doc.data(),

}));

    dados.sort(

      (a: any, b: any) =>

        Number(b.lucroTotal || 0)

        -

        Number(a.lucroTotal || 0)

    );

    setLista(dados);

  }

  return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

      <div className="p-6 border-b border-zinc-800">

        <h2 className="text-2xl font-bold text-white">

          Lucro por Aparelho

        </h2>

        <p className="text-zinc-400 mt-2">

          Transparência completa do resultado financeiro de cada venda.

        </p>

      </div>

      <table className="w-full">

        <thead className="bg-zinc-800">

          <tr>

            <th className="p-4 text-left">
              Produto
            </th>

            <th className="p-4 text-left">
              Cliente
            </th>

            <th className="p-4 text-center">
              Capital
            </th>

            <th className="p-4 text-center">
              Lucro Total
            </th>

            <th className="p-4 text-center">
              Sócio
            </th>

            <th className="p-4 text-center">
              Empresa
            </th>

            <th className="p-4 text-center">
              Recebido
            </th>

            <th className="p-4 text-center">
              Falta Receber
            </th>
<th className="p-4 text-center">
  Recuperação
</th>
<th className="p-4 text-center">
  Status
</th>
          </tr>

        </thead>

        <tbody>

          {lista.map((item: any) => (

            <tr
              key={item.id}
              className="border-t border-zinc-800 hover:bg-zinc-800/40"
            >

              <td className="p-4 text-white">

                {item.produto}

              </td>

              <td className="p-4">

                {item.clienteNome}

              </td>

              <td className="p-4 text-center text-cyan-400">
<td className="p-4">

  <div className="w-full bg-zinc-800 rounded-full h-3">

    <div

      className="bg-green-500 h-3 rounded-full transition-all"

      style={{

        width: `${
          Number(item.capitalInvestido || 0) > 0
            ? (
                Number(item.capitalRecuperado || 0) /
                Number(item.capitalInvestido || 1)
              ) * 100
            : 0
        }%`,

      }}

    />

  </div>

  <p className="text-xs text-center mt-2 text-zinc-400">

    {(
      Number(item.capitalInvestido || 0) > 0
        ? (
            Number(item.capitalRecuperado || 0) /
            Number(item.capitalInvestido || 1)
          ) * 100
        : 0
    ).toFixed(0)}%

  </p>

</td>
                {Number(
                  item.capitalInvestido || 0
                ).toLocaleString(
                  "pt-BR",
                  {
                    style: "currency",
                    currency: "BRL",
                  }
                )}

              </td>

              <td className="p-4 text-center text-green-400 font-bold">

                {Number(
                  item.lucroTotal || 0
                ).toLocaleString(
                  "pt-BR",
                  {
                    style: "currency",
                    currency: "BRL",
                  }
                )}

              </td>

              <td className="p-4 text-center text-blue-400">

                {Number(
                  item.totalSocioReceber || 0
                ).toLocaleString(
                  "pt-BR",
                  {
                    style: "currency",
                    currency: "BRL",
                  }
                )}

              </td>

              <td className="p-4 text-center text-purple-400">

                {Number(
                  item.totalEmpresaReceber || 0
                ).toLocaleString(
                  "pt-BR",
                  {
                    style: "currency",
                    currency: "BRL",
                  }
                )}

              </td>

              <td className="p-4 text-center text-green-500">

                {Number(
                  item.socioRecebido || 0
                ).toLocaleString(
                  "pt-BR",
                  {
                    style: "currency",
                    currency: "BRL",
                  }
                )}

              </td>

              <td className="p-4 text-center text-orange-400">

                {(
                  Number(item.totalSocioReceber || 0)

                  -

                  Number(item.socioRecebido || 0)

                ).toLocaleString(
                  "pt-BR",
                  {
                    style: "currency",
                    currency: "BRL",
                  }
                )}

              </td>
<td className="p-4 text-center">

  {Number(item.capitalRestante || 0) > 0 ? (

    <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">

      Recuperando Capital

    </span>

  ) : Number(item.socioRecebido || 0) < Number(item.totalSocioReceber || 0) ? (

    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">

      Gerando Lucro

    </span>

  ) : (

    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">

      Finalizada

    </span>

  )}

</td>
            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}
