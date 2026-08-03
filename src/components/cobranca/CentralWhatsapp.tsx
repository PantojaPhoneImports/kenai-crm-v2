"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { filtrarPorSocio } from "@/lib/socio";
import { atualizarParcela } from "@/services/parcelas";

type Filtro = "TODOS" | "HOJE" | "AMANHA" | "ATRASO" | "3DIAS" | "ENVIADOS";
const modelos: Record<string, string> = {
  "3 dias": "Olá, {{cliente}}! Seu pagamento de {{valor}} referente a {{produto}} vence em {{vencimento}}. Obrigado, {{empresa}}.",
  "hoje": "Olá, {{cliente}}! A parcela {{parcela}}/{{totalParcelas}} de {{produto}}, no valor de {{valor}}, vence hoje. {{empresa}}.",
  "1 dia de atraso": "Olá, {{cliente}}! Identificamos que a parcela de {{produto}} no valor de {{valor}} venceu em {{vencimento}}. Fale conosco para regularizar. {{empresa}}.",
  "7 dias de atraso": "Olá, {{cliente}}! Sua parcela de {{produto}} no valor de {{valor}} está há 7 dias em atraso. Por favor, entre em contato. {{empresa}}.",
};
function data(p: any) { return p.vencimento?.seconds ? new Date(p.vencimento.seconds * 1000) : new Date(p.vencimento); }
function categoria(p: any) { if (p.status === "PAGA") return ""; const hoje = new Date(); hoje.setHours(0,0,0,0); const dias = Math.ceil((data(p).setHours(0,0,0,0) - hoje.getTime()) / 86400000); return dias < 0 ? "ATRASO" : dias === 0 ? "HOJE" : dias === 1 ? "AMANHA" : dias <= 3 ? "3DIAS" : ""; }
function modelo(p: any) { const c = categoria(p); return c === "ATRASO" ? (Math.ceil((new Date().getTime()-data(p).getTime())/86400000) >= 7 ? "7 dias de atraso" : "1 dia de atraso") : c === "HOJE" ? "hoje" : "3 dias"; }

export default function CentralWhatsapp() {
  const { usuario } = useAuth(); const [parcelas, setParcelas] = useState<any[]>([]); const [filtro, setFiltro] = useState<Filtro>("TODOS"); const [busca, setBusca] = useState("");
  useEffect(() => { if (!usuario) return; return onSnapshot(query(collection(db,"parcelas"),orderBy("vencimento","asc")), s => setParcelas(filtrarPorSocio(s.docs.map(d=>({id:d.id,...d.data()})),usuario).filter((p:any)=>p.status!=="PAGA"))); }, [usuario]);
  const resumo = useMemo(() => ({ ATRASO: parcelas.filter(p=>categoria(p)==="ATRASO"), HOJE: parcelas.filter(p=>categoria(p)==="HOJE"), AMANHA: parcelas.filter(p=>categoria(p)==="AMANHA"), "3DIAS": parcelas.filter(p=>categoria(p)==="3DIAS"), ENVIADOS: parcelas.filter(p=>p.dataUltimaCobranca && new Date(p.dataUltimaCobranca).toDateString()===new Date().toDateString()) }), [parcelas]);
  const lista = useMemo(() => parcelas.filter(p => (filtro === "TODOS" || resumo[filtro].includes(p)) && [p.clienteNome,p.clienteTelefone,p.telefone,p.produtoNome,p.imei,p.cor,p.socioNome].filter(Boolean).join(" ").toLowerCase().includes(busca.toLowerCase())), [parcelas,resumo,filtro,busca]);
  async function enviar(p:any) { const tipo=modelo(p); const valores:Record<string,string>={cliente:p.clienteNome||"",produto:p.produtoNome||"",valor:Number(p.valor||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}),parcela:String(p.parcela||""),totalParcelas:String(p.totalParcelas||""),vencimento:data(p).toLocaleDateString("pt-BR"),empresa:"Pantoja Phone Imports"}; const mensagem=modelos[tipo].replace(/{{(.*?)}}/g,(_,chave)=>valores[chave]||""); await atualizarParcela(p.id,{ultimaCobranca:mensagem,dataUltimaCobranca:new Date().toISOString(),tipoMensagem:tipo,statusEnvio:"ENVIADO"}); window.open(`https://wa.me/55${String(p.clienteTelefone||p.telefone||"").replace(/\D/g,"")}?text=${encodeURIComponent(mensagem)}`,"_blank"); }
  async function enviarTodos() { if (!confirm(`Enviar ${lista.length} cobranças?`)) return; for (const p of lista) { await enviar(p); } }
  const cards: Array<[string, keyof typeof resumo]> = [["Clientes em atraso","ATRASO"],["Vencem hoje","HOJE"],["Vencem amanhã","AMANHA"],["Vencem em 3 dias","3DIAS"],["Cobranças enviadas hoje","ENVIADOS"]];
  return <div className="space-y-6"><div className="grid grid-cols-2 gap-3 xl:grid-cols-5">{cards.map(([t,k])=><button onClick={()=>setFiltro(k)} key={k} className={`rounded-xl border p-4 text-left ${filtro===k?"border-blue-500 bg-blue-500/10":"border-zinc-800 bg-zinc-900"}`}><p className="text-xs text-zinc-400">{t}</p><p className="mt-1 text-2xl font-bold text-white">{resumo[k].length}</p></button>)}</div><div className="flex flex-col gap-3 sm:flex-row"><Input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar cliente, telefone, produto, IMEI, cor ou sócio..."/><Button onClick={enviarTodos} disabled={!lista.length}><Send size={16}/> Enviar para todos</Button></div><div className="overflow-x-auto rounded-2xl border border-zinc-800"><table className="w-full min-w-[900px] text-sm"><thead className="bg-zinc-900 text-zinc-400"><tr>{["Cliente","Telefone","Produto","Sócio","Parcela","Valor","Vencimento","Status","WhatsApp"].map(x=><th key={x} className="p-3 text-left">{x}</th>)}</tr></thead><tbody>{lista.map(p=><tr key={p.id} className="border-t border-zinc-800"><td className="p-3 text-white">{p.clienteNome}<p className="text-xs text-zinc-500">{p.dataUltimaCobranca?`Última: ${new Date(p.dataUltimaCobranca).toLocaleString("pt-BR")} • ${p.tipoMensagem}`:"Sem cobrança enviada"}</p></td><td className="p-3">{p.clienteTelefone||p.telefone||"-"}</td><td className="p-3">{p.produtoNome}</td><td className="p-3">{p.socioNome}</td><td className="p-3">{p.parcela}/{p.totalParcelas}</td><td className="p-3 text-green-400">{Number(p.valor).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td><td className="p-3">{data(p).toLocaleDateString("pt-BR")}</td><td className="p-3">{categoria(p)||"Pendente"}</td><td className="p-3"><Button size="sm" onClick={()=>enviar(p)} disabled={!(p.clienteTelefone||p.telefone)}><MessageCircle size={16}/> Enviar</Button></td></tr>)}</tbody></table></div></div>;
}
