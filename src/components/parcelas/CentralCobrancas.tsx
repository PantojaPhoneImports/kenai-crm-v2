"use client";

import {
  AlertTriangle,
  CalendarDays,
  Bell,
  MessageCircle,
} from "lucide-react";

interface Props {
  atrasadas: number;
  hoje: number;
  lembrar: number;

  listaAtrasadas: any[];
  listaHoje: any[];
  lista3Dias: any[];
}

export default function CentralCobrancas({
  atrasadas,
  hoje,
  lembrar,
  listaAtrasadas,
  listaHoje,
  lista3Dias,
}: Props) {

  function Card({
    titulo,
    cor,
    quantidade,
    lista,
  }: {
    titulo: string;
    cor: "red" | "yellow" | "blue";
    quantidade: number;
    lista: any[];
  }) {

    const classes = {
      red: {
        border: "border-red-500",
        bg: "bg-red-500/10",
        text: "text-red-400",
        icon: <AlertTriangle size={24} />,
      },
      yellow: {
        border: "border-yellow-500",
        bg: "bg-yellow-500/10",
        text: "text-yellow-400",
        icon: <CalendarDays size={24} />,
      },
      blue: {
        border: "border-blue-500",
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        icon: <Bell size={24} />,
      },
    };

    const estilo = classes[cor];

    return (

      <div className={`rounded-2xl border ${estilo.border} ${estilo.bg} p-5`}>

        <div className="flex justify-between items-center">

          <div>

            <p className="text-zinc-400">

              {titulo}

            </p>

            <h2 className="text-4xl font-bold text-white">

              {quantidade}

            </h2>

          </div>

          <div className={estilo.text}>

            {estilo.icon}

          </div>

        </div>

        <div className="mt-5 space-y-2">

          {lista.length === 0 ? (

            <p className="text-zinc-500 text-sm">

              Nenhum cliente.

            </p>

          ) : (

            lista.slice(0,5).map((item:any)=>(

              <div

                key={item.id}

                className="flex justify-between items-center bg-zinc-900 rounded-lg px-3 py-2"

              >

                <div>

                  <p className="text-white text-sm font-medium">

                    {item.clienteNome}

                  </p>

                  <p className="text-zinc-500 text-xs">

                    {Number(item.valor).toLocaleString("pt-BR",{
                      style:"currency",
                      currency:"BRL"
                    })}

                  </p>

                </div>

                <button

                  className="bg-green-600 hover:bg-green-700 rounded-lg p-2"

                >

                  <MessageCircle size={16}/>

                </button>

              </div>

            ))

          )}

        </div>

      </div>

    );

  }

  return (

    <div className="grid md:grid-cols-3 gap-6">

      <Card

        titulo="Em atraso"

        cor="red"

        quantidade={atrasadas}

        lista={listaAtrasadas}

      />

      <Card

        titulo="Vencem hoje"

        cor="yellow"

        quantidade={hoje}

        lista={listaHoje}

      />

      <Card

        titulo="Vencem em 3 dias"

        cor="blue"

        quantidade={lembrar}

        lista={lista3Dias}

      />

    </div>

  );

}