"use client";

import {
  Wallet,
  CheckCircle2,
  TrendingUp,
  CreditCard,
} from "lucide-react";

interface Props {

  financiado: number;

  recebido: number;

  saldo: number;

  proximo: Date | null;

}

export default function ClienteResumo({

  financiado,

  recebido,

  saldo,

  proximo,

}: Props) {

  return (

    <div className="grid grid-cols-2 gap-5 px-5 pb-5 sm:px-6 sm:pb-6 xl:grid-cols-4 xl:gap-8">

      <div>

        <div className="flex items-center gap-2 text-cyan-400">

          <TrendingUp size={18} />

          <span className="text-sm">

            Financiado

          </span>

        </div>

        <p className="text-xl font-bold text-white mt-2">

          {financiado.toLocaleString(

            "pt-BR",

            {

              style: "currency",

              currency: "BRL",

            }

          )}

        </p>

      </div>

      <div>

        <div className="flex items-center gap-2 text-green-400">

          <CheckCircle2 size={18} />

          <span className="text-sm">

            Recebido

          </span>

        </div>

        <p className="text-xl font-bold text-white mt-2">

          {recebido.toLocaleString(

            "pt-BR",

            {

              style: "currency",

              currency: "BRL",

            }

          )}

        </p>

      </div>

      <div>

        <div className="flex items-center gap-2 text-yellow-400">

          <Wallet size={18} />

          <span className="text-sm">

            Saldo Devedor

          </span>

        </div>

        <p className="text-xl font-bold text-white mt-2">

          {saldo.toLocaleString(

            "pt-BR",

            {

              style: "currency",

              currency: "BRL",

            }

          )}

        </p>

      </div>

      <div>

        <div className="flex items-center gap-2 text-blue-400">

          <CreditCard size={18} />

          <span className="text-sm">

            Próxima Parcela

          </span>

        </div>

        <p className="text-xl font-bold text-white mt-2">

  {proximo

    ? new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Belem",
      }).format(proximo)

    : "--/--/----"}

</p>

      </div>

    </div>

  );

}
