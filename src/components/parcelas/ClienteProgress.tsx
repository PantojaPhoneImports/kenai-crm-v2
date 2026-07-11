"use client";

interface Props {

  percentual: number;

  pagas: number;

  pendentes: number;

}

export default function ClienteProgress({

  percentual,

  pagas,

  pendentes,

}: Props) {

  return (

    <div className="px-6 pb-6">

      <div className="flex justify-between items-center mb-2">

        <span className="text-zinc-400 text-sm">

          Progresso do Financiamento

        </span>

        <span className="text-white font-semibold">

          {percentual}%

        </span>

      </div>

      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">

        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{
            width: `${percentual}%`,
          }}
        />

      </div>

      <div className="flex justify-between mt-3 text-sm">

        <span className="text-green-400">

          ✅ {pagas} Pagas

        </span>

        <span className="text-yellow-400">

          ⏳ {pendentes} Pendentes

        </span>

      </div>

    </div>

  );

}