"use client";

interface Props { percentual: number; pagas: number; pendentes: number; }

export default function ClienteProgress({ percentual, pagas, pendentes }: Props) {
  return <div className="px-5 pb-5 sm:px-6 sm:pb-6">
    <div className="mb-2 flex items-center justify-between text-sm">
      <span className="text-zinc-400">Progresso do financiamento</span>
      <span className="font-bold text-white">{percentual}%</span>
    </div>
    <div className="h-3 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500" style={{ width: `${percentual}%` }} /></div>
    <div className="mt-3 flex items-center gap-4 text-sm"><span className="font-semibold text-green-400">{pagas} pagas</span><span className="font-semibold text-yellow-400">{pendentes} restantes</span></div>
  </div>;
}
