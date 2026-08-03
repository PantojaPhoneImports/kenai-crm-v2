"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";

type Log = { id: string; cliente?: string; telefone?: string; data?: string; provider?: string; resultado?: string; erro?: string; mensagem?: string };
const porPagina = 20;
export default function LogsCobrancaPage() {
  const [logs, setLogs] = useState<Log[]>([]); const [busca, setBusca] = useState(""); const [status, setStatus] = useState("TODOS"); const [pagina, setPagina] = useState(0);
  useEffect(() => onSnapshot(query(collection(db, "cobrancaLogs"), orderBy("data", "desc")), snap => setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Log))), []);
  const filtrados = useMemo(() => logs.filter(log => { const texto = [log.cliente, log.telefone, log.provider, log.mensagem, log.erro].filter(Boolean).join(" ").toLowerCase(); return (status === "TODOS" || log.resultado === status) && texto.includes(busca.toLowerCase()); }), [logs, busca, status]);
  const paginas = Math.max(1, Math.ceil(filtrados.length / porPagina)); const exibidos = filtrados.slice(pagina * porPagina, (pagina + 1) * porPagina);
  useEffect(() => setPagina(0), [busca, status]);
  return <Layout><div className="space-y-6"><div><h1 className="text-3xl font-bold text-white">Logs de Cobrança</h1><p className="mt-2 text-zinc-400">Histórico de tentativas registrado pela Central WhatsApp.</p></div><div className="flex flex-col gap-3 sm:flex-row"><Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Cliente, telefone, provider, mensagem ou erro..." /><select value={status} onChange={e => setStatus(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-white"><option value="TODOS">Todos os status</option><option value="ENVIADA">Enviadas</option><option value="PENDENTE">Pendentes</option><option value="ERRO">Erros</option></select></div><div className="overflow-x-auto rounded-2xl border border-zinc-800"><table className="w-full min-w-[1000px] text-sm"><thead className="bg-zinc-900 text-zinc-400"><tr>{["Cliente", "Telefone", "Data", "Hora", "Provider", "Status", "Erro", "Mensagem enviada"].map(item => <th key={item} className="p-3 text-left">{item}</th>)}</tr></thead><tbody>{exibidos.length ? exibidos.map(log => { const data = log.data ? new Date(log.data) : null; return <tr key={log.id} className="border-t border-zinc-800"><td className="p-3 text-white">{log.cliente || "-"}</td><td className="p-3">{log.telefone || "-"}</td><td className="p-3">{data?.toLocaleDateString("pt-BR") || "-"}</td><td className="p-3">{data?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) || "-"}</td><td className="p-3">{log.provider || "-"}</td><td className="p-3">{log.resultado || "-"}</td><td className="max-w-48 truncate p-3 text-red-300">{log.erro || "-"}</td><td className="max-w-80 truncate p-3">{log.mensagem || "-"}</td></tr>; }) : <tr><td colSpan={8} className="p-12 text-center text-zinc-400">Nenhum log encontrado.</td></tr>}</tbody></table></div><div className="flex items-center justify-between text-sm text-zinc-400"><span>{filtrados.length} registro(s)</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>Anterior</Button><span className="px-2 py-1">{pagina + 1} / {paginas}</span><Button size="sm" variant="outline" disabled={pagina + 1 >= paginas} onClick={() => setPagina(pagina + 1)}>Próxima</Button></div></div></div></Layout>;
}
