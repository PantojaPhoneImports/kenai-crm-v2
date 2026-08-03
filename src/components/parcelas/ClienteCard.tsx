"use client";

import { useEffect, useMemo, useState } from "react";

import ClienteHeader from "./ClienteHeader";
import ClienteResumo from "./ClienteResumo";
import ClienteProgress from "./ClienteProgress";
import ParcelaItem from "./ParcelaItem";

import { buscarCliente } from "@/services/clientes";

interface Props {
  cliente: string;
  telefone?: string;
  parcelas: any[];
  onExcluir: (id: string) => void;
}

export default function ClienteCard({
  cliente,
  telefone,
  parcelas,
  onExcluir,
}: Props) {

  const [aberto, setAberto] = useState(true);

  const [telefoneCliente, setTelefoneCliente] =
    useState(telefone || "");

  useEffect(() => {

    carregarTelefone();

  }, []);

  async function carregarTelefone() {

    if (telefone) {

      setTelefoneCliente(telefone);

      return;

    }

    try {

      const dados = await buscarCliente(cliente);

      if (dados?.telefone) {

        setTelefoneCliente(dados.telefone);

      }

    } catch {

      console.log("Telefone não encontrado.");

    }

  }

  const resumo = useMemo(() => {

    let financiado = 0;

    let recebido = 0;

    let saldo = 0;

    let pagas = 0;

    let pendentes = 0;

    let proximo: Date | null = null;

    let alerta: "OK" | "3DIAS" | "HOJE" | "ATRASADO" = "OK";

    parcelas.forEach((parcela: any) => {

      const valor = Number(parcela.valor || 0);

      financiado += valor;

      const vencimento = parcela.vencimento?.seconds

        ? new Date(parcela.vencimento.seconds * 1000)

        : new Date(parcela.vencimento);

      if (parcela.status === "PAGA") {

        recebido += valor;

        pagas++;

      } else {

        saldo += valor;

        pendentes++;

        if (!proximo || vencimento < proximo) {

          proximo = vencimento;

        }

        const hoje = new Date();

        hoje.setHours(0,0,0,0);

        const dias = Math.ceil(

          (vencimento.getTime() - hoje.getTime())

          /

          (1000 * 60 * 60 * 24)

        );

        if (dias < 0) {

          alerta = "ATRASADO";

        } else if (

          dias === 0 &&

          alerta !== "ATRASADO"

        ) {

          alerta = "HOJE";

        } else if (

          dias <= 3 &&

          alerta === "OK"

        ) {

          alerta = "3DIAS";

        }

      }

    });

    const percentual = financiado

      ? Math.round(

          (recebido / financiado) * 100

        )

      : 0;

    return {

  financiado,

  recebido,

  saldo,

  pagas,

  pendentes,

  percentual,

  proximo,

  alerta: alerta as
    | "OK"
    | "3DIAS"
    | "HOJE"
    | "ATRASADO",

};

  }, [parcelas]);

  let corBorda = "border-zinc-800";

  if (resumo.alerta === "ATRASADO") {

    corBorda = "border-red-500";

  } else if (resumo.alerta === "HOJE") {

    corBorda = "border-yellow-500";

  } else if (resumo.alerta === "3DIAS") {

    corBorda = "border-blue-500";

  }

  return (

    <div
      className={`rounded-2xl border ${corBorda} bg-zinc-900 overflow-hidden`}
    >
              <ClienteHeader

        aberto={aberto}

        setAberto={setAberto}

        cliente={cliente}

        telefone={telefoneCliente}

        alerta={resumo.alerta}

        parcelas={parcelas}

      />

      <ClienteResumo

        financiado={resumo.financiado}

        recebido={resumo.recebido}

        saldo={resumo.saldo}

        proximo={resumo.proximo}

      />

      <ClienteProgress

        percentual={resumo.percentual}

        pagas={resumo.pagas}

        pendentes={resumo.pendentes}

      />

      {aberto && (

        <div>

          <div className="hidden grid-cols-6 gap-6 bg-zinc-800 px-6 py-4 text-sm font-semibold text-zinc-400 sm:grid">

            <div>

              Produto

            </div>

            <div className="text-center">

              Parcela

            </div>

            <div className="text-center">

              Vencimento

            </div>

            <div className="text-center">

              Valor

            </div>

            <div className="text-center">

              Status

            </div>

            <div className="text-right">

              Ações

            </div>

          </div>

          {parcelas.map((parcela: any) => (

            <ParcelaItem

              key={parcela.id}

              parcela={parcela}

              onExcluir={onExcluir}

            />

          ))}

        </div>

      )}

    </div>

  );

}
