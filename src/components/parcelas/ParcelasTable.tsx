"use client";

import { useEffect, useMemo, useState } from "react";

import {
  listarParcelas,
  excluirParcela,
} from "@/services/parcelas";

import ClienteCard from "./ClienteCard";
import ParcelasResumo from "./ParcelasResumo";
import ParcelasFiltro from "./ParcelasFiltro";
import CentralCobrancas from "./CentralCobrancas";

export default function ParcelasTable() {

  const [parcelas, setParcelas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {

    carregar();

  }, []);

  async function carregar() {

    const dados = await listarParcelas();

    dados.sort((a: any, b: any) => {

      const cliente = (a.clienteNome || "")
        .localeCompare(b.clienteNome || "");

      if (cliente !== 0) return cliente;

      const produto = (a.produtoNome || "")
        .localeCompare(b.produtoNome || "");

      if (produto !== 0) return produto;

      return Number(a.parcela) - Number(b.parcela);

    });

    setParcelas(dados);

  }

  async function apagar(id: string) {

    if (!confirm("Deseja excluir esta parcela?")) {

      return;

    }

    await excluirParcela(id);

    carregar();

  }

  const hoje = new Date();

  hoje.setHours(0,0,0,0);

  let receber = 0;

  let pendentes = 0;

  let pagas = 0;

  let atrasadas = 0;

  let vencemHoje = 0;

  let vencem3Dias = 0;

  const listaAtrasadas:any[] = [];

  const listaHoje:any[] = [];

  const lista3Dias:any[] = [];

  parcelas.forEach((parcela:any)=>{

    const vencimento = parcela.vencimento?.seconds

      ? new Date(parcela.vencimento.seconds * 1000)

      : new Date(parcela.vencimento);

    vencimento.setHours(0,0,0,0);

    const dias = Math.ceil(

      (vencimento.getTime()-hoje.getTime())

      /(1000*60*60*24)

    );

    if(parcela.status==="PAGA"){

      pagas++;

      return;

    }

    pendentes++;

    receber += Number(parcela.valor || 0);

    const item={

      ...parcela,

      telefone:

        parcela.clienteTelefone ||

        parcela.telefone ||

        "",

    };

    if(dias<0){

      atrasadas++;

      listaAtrasadas.push(item);

    }

    else if(dias===0){

      vencemHoje++;

      listaHoje.push(item);

    }

    else if(dias<=3){

      vencem3Dias++;

      lista3Dias.push(item);

    }

  });

  const clientes = useMemo(()=>{

    const mapa:Record<string,any>={};

    parcelas.forEach((parcela:any)=>{

      const texto=busca.toLowerCase();

      if(

        busca &&

        !parcela.clienteNome?.toLowerCase().includes(texto) &&

        !parcela.produtoNome?.toLowerCase().includes(texto)

      ){

        return;

      }

      if(!mapa[parcela.clienteNome]){

        mapa[parcela.clienteNome]={

          cliente:parcela.clienteNome,

          telefone:

            parcela.clienteTelefone ||

            "",

          parcelas:[],

        };

      }

      mapa[parcela.clienteNome]

        .parcelas

        .push(parcela);

    });

    return Object.values(mapa);

  },[parcelas,busca]);
    return (

    <div className="space-y-8">

      <CentralCobrancas

        atrasadas={atrasadas}

        hoje={vencemHoje}

        lembrar={vencem3Dias}

        listaAtrasadas={listaAtrasadas}

        listaHoje={listaHoje}

        lista3Dias={lista3Dias}

      />

      <ParcelasResumo

        receber={receber}

        pendentes={pendentes}

        pagas={pagas}

        atrasadas={atrasadas}

      />

      <ParcelasFiltro

        busca={busca}

        setBusca={setBusca}

      />

      <div className="space-y-6">

        {clientes.length === 0 ? (

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl py-16">

            <p className="text-center text-zinc-500 text-lg">

              Nenhuma parcela encontrada.

            </p>

          </div>

        ) : (

          clientes.map((cliente:any)=>(

            <ClienteCard

              key={cliente.cliente}

              cliente={cliente.cliente}

              telefone={cliente.telefone}

              parcelas={cliente.parcelas}

              onExcluir={apagar}

            />

          ))

        )}

      </div>

    </div>

  );

}