"use client";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Copy, Loader2, RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
type Estado = { enabled?: boolean; configured?: boolean; sendingConfigured?: boolean; webhookConfigured?: boolean; ready?: boolean; missing?: string[]; webhookUrl?: string; message?: string; error?: string };
export default function MetaCloudStatus({ onActivated }: { onActivated?: () => void }) {
  const [estado, setEstado] = useState<Estado>({}); const [carregando, setCarregando] = useState(true);
  const carregar = useCallback(async () => { setCarregando(true); try { const token = await auth.currentUser?.getIdToken(); if (!token) throw new Error("Sessão expirada."); const response = await fetch("/api/whatsapp/meta", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }); const data = await response.json(); setEstado(response.ok ? data : { error: data.error || "Falha ao consultar Meta." }); } catch (error) { setEstado({ error: error instanceof Error ? error.message : "Falha ao consultar Meta." }); } finally { setCarregando(false); } }, []);
  useEffect(() => { void carregar(); }, [carregar]);
  const ativar = useCallback(async () => {
    setCarregando(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Sessão expirada.");
      const response = await fetch("/api/whatsapp/meta", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ action: "activate-provider" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao ativar a Meta Cloud API.");
      onActivated?.();
      await carregar();
    } catch (error) { setEstado(atual => ({ ...atual, error: error instanceof Error ? error.message : "Falha ao ativar a Meta Cloud API." })); setCarregando(false); }
  }, [carregar, onActivated]);
  if (carregando) return <p className="mt-4 flex items-center gap-2 text-xs text-zinc-400"><Loader2 size={14} className="animate-spin"/> Verificando configuração segura...</p>;
  return <div className="mt-4 space-y-3 rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-xs"><p className={`flex items-center gap-2 font-semibold ${estado.ready ? "text-emerald-300" : "text-amber-200"}`}>{estado.ready ? <CheckCircle2 size={15}/> : <ShieldAlert size={15}/>} {estado.error || estado.message}</p>{!!estado.missing?.length && <div><p className="text-zinc-400">Faltando na Vercel (Production):</p><ul className="mt-1 space-y-1 font-mono text-amber-300">{estado.missing.map(item => <li key={item}>• {item}</li>)}</ul></div>}{estado.webhookUrl && <div><p className="text-zinc-400">Callback URL do webhook:</p><div className="mt-1 flex items-center gap-2"><code className="min-w-0 flex-1 truncate text-blue-300">{estado.webhookUrl}</code><button title="Copiar URL" onClick={() => navigator.clipboard.writeText(estado.webhookUrl || "")}><Copy size={14}/></button></div></div>}<p className="text-zinc-500">Envio: {estado.sendingConfigured ? "configurado" : "incompleto"}. Webhook: {estado.webhookConfigured ? "configurado" : "incompleto"}. Nenhum segredo é retornado ao navegador.</p><div className="flex flex-wrap gap-2"><Button size="sm" onClick={ativar} disabled={!estado.ready}><CheckCircle2 size={13}/> Ativar Meta Cloud API</Button><Button size="sm" variant="outline" onClick={carregar}><RefreshCw size={13}/> Atualizar diagnóstico</Button></div></div>;
}
