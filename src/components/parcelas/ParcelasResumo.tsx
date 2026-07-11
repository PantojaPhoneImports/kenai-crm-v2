"use client";

import {
  Wallet,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface Props {
  receber: number;
  pendentes: number;
  pagas: number;
  atrasadas: number;
}

export default function ParcelasResumo({
  receber,
  pendentes,
  pagas,
  atrasadas,
}: Props) {

  const cards = [

    {
      titulo: "Valor a Receber",
      valor: receber.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      icon: Wallet,
      cor: "text-green-400",
    },

    {
      titulo: "Parcelas Pendentes",
      valor: pendentes,
      icon: CreditCard,
      cor: "text-yellow-400",
    },

    {
      titulo: "Parcelas Pagas",
      valor: pagas,
      icon: CheckCircle2,
      cor: "text-emerald-400",
    },

    {
      titulo: "Parcelas Atrasadas",
      valor: atrasadas,
      icon: AlertTriangle,
      cor: "text-red-400",
    },

  ];

  return (

    <div className="grid grid-cols-4 gap-6">

      {cards.map((card) => {

        const Icon = card.icon;

        return (

          <div
            key={card.titulo}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-blue-600 transition-all"
          >

            <div className="flex justify-between items-center">

              <div>

                <p className="text-zinc-400 text-sm">

                  {card.titulo}

                </p>

                <h2 className="text-3xl font-bold text-white mt-2">

                  {card.valor}

                </h2>

              </div>

              <div className="bg-zinc-800 rounded-xl p-3">

                <Icon
                  size={28}
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