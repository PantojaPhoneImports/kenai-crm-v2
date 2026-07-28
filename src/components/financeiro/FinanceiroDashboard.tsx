"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

import {
  DollarSign,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  PiggyBank,
} from "lucide-react";

import { listarParcelas } from "@/services/parcelas";
import { listarProdutos } from "@/services/estoque";
import { listarVendas } from "@/services/vendas";
import { calcularResumoSocio } from "@/services/resumoFinanceiro";

export default function FinanceiroDashboard() {

  const { usuario } = useAuth();

  const [recebido, setRecebido] = useState(0);
  const [receber, setReceber] = useState(0);
  const [investido, setInvestido] = useState(0);
  const [lucro, setLucro] = useState(0);
  const [meuLucro, setMeuLucro] = useState(0);
  const [vendas, setVendas] = useState(0);
  const [atrasadas, setAtrasadas] = useState(0);
const [capitalRecuperado, setCapitalRecuperado] = useState(0);

const [capitalRestante, setCapitalRestante] = useState(0);

const [lucroReceber, setLucroReceber] = useState(0);

const [lucroEmpresa, setLucroEmpresa] = useState(0);
  useEffect(() => {

    if (usuario) {

      carregar();

    }

  }, [usuario]);

  async function carregar() {

    // ==========================
    // DASHBOARD DO SÓCIO
    // ==========================

    if (usuario?.perfil === "SOCIO") {

      const parcelas = await listarParcelas();

      const resumo = await calcularResumoSocio(
        usuario.socioId
      );

      setRecebido(resumo.recebido);
      setReceber(resumo.receber);
      setInvestido(resumo.capitalInvestido);
      setLucro(resumo.lucroTotal);
      setMeuLucro(resumo.lucroRecebido);
      setVendas(resumo.vendas);
setCapitalRecuperado(
  resumo.capitalRecuperado
);

setCapitalRestante(
  resumo.capitalRestante
);

setLucroReceber(
  resumo.lucroReceber
);
      const hoje = new Date();

      const atrasadas = parcelas.filter((p: any) => {

        if (p.socioId !== usuario.socioId)
          return false;

        if (p.status === "PAGA")
          return false;

        const vencimento =
          p.vencimento?.seconds
            ? new Date(
                p.vencimento.seconds * 1000
              )
            : new Date(p.vencimento);

        return vencimento < hoje;

      }).length;

      setAtrasadas(atrasadas);

      return;

    }

    // ==========================
    // DASHBOARD ADMIN
    // ==========================

    const parcelas = await listarParcelas();

    const produtos = await listarProdutos();

    const vendasLista = await listarVendas();

    setVendas(vendasLista.length);

    const capital = produtos.reduce(

      (total: number, produto: any) =>

        total + Number(produto.custo || 0),

      0

    );

    setInvestido(capital);

    let totalRecebido = 0;
    let totalReceber = 0;
    let parcelasAtrasadas = 0;

    const hoje = new Date();

    parcelas.forEach((parcela: any) => {

      const valor = Number(parcela.valor || 0);

      if (parcela.status === "PAGA") {

        totalRecebido += valor;

      } else {

        totalReceber += valor;

      }

      const vencimento =
        parcela.vencimento?.seconds
          ? new Date(
              parcela.vencimento.seconds * 1000
            )
          : new Date(
              parcela.vencimento
            );

      if (

        parcela.status !== "PAGA"

        &&

        vencimento < hoje

      ) {

        parcelasAtrasadas++;

      }

    });

    setRecebido(totalRecebido);
    setReceber(totalReceber);
    setAtrasadas(parcelasAtrasadas);

    let lucroTotal = 0;

    vendasLista.forEach((venda: any) => {

      lucroTotal +=

        Number(venda.valorProduto || 0)

        -

        Number(venda.custoProduto || 0);

    });

    setLucro(lucroTotal);

    setMeuLucro(0);
setCapitalRecuperado(0);

setCapitalRestante(0);

setLucroReceber(0);

setLucroEmpresa(0);
  }

  const cards = [

  {
    titulo: "Recebido",
    valor: recebido,
    icone: DollarSign,
    cor: "text-green-400",
  },

  {
    titulo: "A Receber",
    valor: receber,
    icone: Wallet,
    cor: "text-blue-400",
  },

  {
    titulo: "Capital Investido",
    valor: investido,
    icone: PiggyBank,
    cor: "text-yellow-400",
  },

  ...(usuario?.perfil === "SOCIO"
    ? [
        {
          titulo: "Capital Recuperado",
          valor: capitalRecuperado,
          icone: TrendingUp,
          cor: "text-emerald-400",
        },

        {
          titulo: "Capital Restante",
          valor: capitalRestante,
          icone: AlertTriangle,
          cor: "text-orange-400",
        },

        {
          titulo: "Lucro Recebido",
          valor: meuLucro,
          icone: DollarSign,
          cor: "text-green-500",
        },

        {
          titulo: "Lucro a Receber",
          valor: lucroReceber,
          icone: Wallet,
          cor: "text-cyan-400",
        },
      ]
    : [
        {
          titulo: "Lucro Total",
          valor: lucro,
          icone: TrendingUp,
          cor: "text-emerald-400",
        },
      ]),

  {
    titulo: "Parcelas Atrasadas",
    valor: atrasadas,
    icone: AlertTriangle,
    cor: "text-red-400",
    numero: true,
  },

  {
    titulo: "Vendas",
    valor: vendas,
    icone: TrendingDown,
    cor: "text-violet-400",
    numero: true,
  },

];

  return (

    <div className="grid grid-cols-3 gap-6">

      {cards.map((card: any) => {

        const Icon = card.icone;

        return (

          <div
            key={card.titulo}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-blue-600 transition-all"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-zinc-400 text-sm">

                  {card.titulo}

                </p>

                <h2 className="text-3xl font-bold text-white mt-2">

                  {card.numero
                    ? Number(card.valor)
                    : Number(card.valor).toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                        }
                      )}

                </h2>

              </div>

              <div className="bg-zinc-800 rounded-xl p-3">

                <Icon
                  size={26}
                  className={card.cor}
                />

              </div>

            </div>

          </div>

        );

      })}

    </div>

  );

}