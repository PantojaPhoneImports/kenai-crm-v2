"use client";

export default function DashboardChart() {

  return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

      <h2 className="text-2xl font-bold text-white mb-6">
        Resumo de Vendas
      </h2>

      <div className="space-y-5">

        <div>
          <div className="flex justify-between text-zinc-400 mb-1">
            <span>Janeiro</span>
            <span>35%</span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-3">
            <div className="bg-blue-500 h-3 rounded-full w-[35%]"></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-zinc-400 mb-1">
            <span>Fevereiro</span>
            <span>55%</span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full w-[55%]"></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-zinc-400 mb-1">
            <span>Março</span>
            <span>80%</span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-3">
            <div className="bg-yellow-500 h-3 rounded-full w-[80%]"></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-zinc-400 mb-1">
            <span>Abril</span>
            <span>65%</span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-3">
            <div className="bg-purple-500 h-3 rounded-full w-[65%]"></div>
          </div>
        </div>

      </div>

    </div>

  );

}