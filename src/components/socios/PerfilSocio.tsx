"use client";
import { useEffect, useState } from "react";
import { calcularResumoSocio } from "@/services/resumoFinanceiro";
import {
  Users,
  Smartphone,
  DollarSign,
  Wallet,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";

import { buscarSocio } from "@/services/socios";


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
const [capitalRecuperado, setCapitalRecuperado] = useState(0);

const [capitalRestante, setCapitalRestante] = useState(0);

const [lucroRecebido, setLucroRecebido] = useState(0);

const [lucroReceber, setLucroReceber] = useState(0);
  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {

  const dados = await buscarSocio(id);

  if (!dados) return;

  setSocio(dados);

  const resumo = await calcularResumoSocio(id);

  setCapital(resumo.capitalInvestido);

  setEstoque(resumo.estoque);

  setClientes(resumo.clientes);

  setReceber(resumo.receber);

  setRecebido(resumo.recebido);

  setLucro(resumo.lucroRecebido);

  setVendas(resumo.vendas);

  setCapitalRecuperado(
    resumo.capitalRecuperado
  );

  setCapitalRestante(
    resumo.capitalRestante
  );

  setLucroRecebido(
    resumo.lucroRecebido
  );

  setLucroReceber(
    resumo.lucroReceber
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
  titulo="Capital Recuperado"
  valor={capitalRecuperado.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}
  icone={<TrendingUp className="text-green-400" size={30} />}
/>

<Card
  titulo="Capital Restante"
  valor={capitalRestante.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}
  icone={<Wallet className="text-yellow-400" size={30} />}
/>

<Card
  titulo="Lucro Recebido"
  valor={lucroRecebido.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}
  icone={<DollarSign className="text-cyan-400" size={30} />}
/>

<Card
  titulo="Lucro a Receber"
  valor={lucroReceber.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}
  icone={<DollarSign className="text-blue-400" size={30} />}
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
