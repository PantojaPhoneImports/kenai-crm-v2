"use client";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function RepassesTable() {

  const [repasses, setRepasses] =
    useState<any[]>([]);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {

    const snapshot =
      await getDocs(
        collection(db, "repasses")
      );

    const lista = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
lista.sort(
  (a: any, b: any) =>
    new Date(b.data).getTime() -
    new Date(a.data).getTime()
);
    setRepasses(lista);

  }

  return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

      <table className="mobile-card-table w-full">

        <thead className="bg-zinc-800">

          <tr>

            <th className="p-4 text-left">
              Cliente
            </th>

            <th className="p-4 text-left">
              Produto
            </th>

            <th className="p-4 text-center">
              Sócio
            </th>

            <th className="p-4 text-center">
              Capital Investido
            </th>

            <th className="p-4 text-center">
              Capital Recuperado
            </th>

            <th className="p-4 text-center">
              Capital Restante
            </th>

            <th className="p-4 text-center">
              Lucro Recebido
            </th>

            <th className="p-4 text-center">
              Lucro a Receber
            </th>

            <th className="p-4 text-center">
              Total Recebido
            </th>

          </tr>

        </thead>

        <tbody>

          {repasses
  .filter((repasse:any)=>repasse.status==="ATIVO")
  .map((repasse:any)=>(

            <tr
              key={repasse.id}
              className="border-t border-zinc-800 hover:bg-zinc-800/40"
            >

              <td data-label="Cliente" className="p-4">
                {repasse.clienteNome}
              </td>

              <td data-label="Produto" className="p-4">
                {repasse.produto}
              </td>

              <td data-label="Sócio" className="p-4 text-center">
                {repasse.socioNome}
              </td>

              <td data-label="Capital Investido" className="p-4 text-center text-cyan-400">

                {Number(
                  repasse.capitalInvestido || 0
                ).toLocaleString(
                  "pt-BR",
                  {
                    style:"currency",
                    currency:"BRL",
                  }
                )}

              </td>

              <td data-label="Capital Recuperado" className="p-4 text-center text-green-400">

                {Number(
                  repasse.capitalRecuperado || 0
                ).toLocaleString(
                  "pt-BR",
                  {
                    style:"currency",
                    currency:"BRL",
                  }
                )}

              </td>

              <td data-label="Capital Restante" className="p-4 text-center text-yellow-400">

                {Number(
                  repasse.capitalRestante || 0
                ).toLocaleString(
                  "pt-BR",
                  {
                    style:"currency",
                    currency:"BRL",
                  }
                )}

              </td>

              <td data-label="Lucro Recebido" className="p-4 text-center text-green-400">

                {(
                  Number(repasse.socioRecebido || 0)
                  -
                  Number(repasse.capitalRecuperado || 0)
                ).toLocaleString(
                  "pt-BR",
                  {
                    style:"currency",
                    currency:"BRL",
                  }
                )}

              </td>

              <td data-label="Lucro a Receber" className="p-4 text-center text-orange-400">

                {(
                  Number(repasse.totalSocioReceber || 0)
                  -
                  Number(repasse.socioRecebido || 0)
                ).toLocaleString(
                  "pt-BR",
                  {
                    style:"currency",
                    currency:"BRL",
                  }
                )}

              </td>

              <td data-label="Total Recebido" className="p-4 text-center font-bold text-white">

                {Number(
                  repasse.socioRecebido || 0
                ).toLocaleString(
                  "pt-BR",
                  {
                    style:"currency",
                    currency:"BRL",
                  }
                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}
