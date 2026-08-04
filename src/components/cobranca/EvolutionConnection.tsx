"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, QrCode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Estado = { instance?: string; status?: "CONECTADO" | "DESCONECTADO" | "CONECTANDO"; qrCode?: string | null; criada?: boolean; error?: string };
const cor: Record<string, string> = { CONECTADO: "text-emerald-300 bg-emerald-500/15", CONECTANDO: "text-amber-300 bg-amber-500/15", DESCONECTADO: "text-red-300 bg-red-500/15" };

export default function EvolutionConnection() {
  const [estado, setEstado] = useState<Estado>({}); const [carregando, setCarregando] = useState(false);
  const requisitar = useCallback(async (action: "connect" | "reconnect" | "status") => { setCarregando(true); try { const resposta = await fetch("/api/whatsapp/evolution", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) }); const dados = await resposta.json(); setEstado(dados); } catch { setEstado({ error: "Não foi possível comunicar com a Evolution." }); } finally { setCarregando(false); } }, []);
  useEffect(() => { requisitar("connect"); }, [requisitar]);
  return <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-950 p-4"><div className="flex items-center justify-between gap-2"><div><p className="text-sm font-medium text-white">Instância {estado.instance || "kenai-crm"}</p><p className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${cor[estado.status || "DESCONECTADO"]}`}>{estado.status || "CARREGANDO"}</p></div><Button size="sm" variant="outline" onClick={() => requisitar("status")} disabled={carregando}><RefreshCw size={14} className={carregando ? "animate-spin" : ""} /> Atualizar</Button></div>{estado.error ? <p className="mt-3 text-xs text-red-300">{estado.error}</p> : estado.qrCode && estado.status !== "CONECTADO" ? <div className="mt-4 text-center"><img src={estado.qrCode} alt="QR Code para conectar WhatsApp" className="mx-auto h-48 w-48 rounded-lg bg-white p-2" /><p className="mt-2 text-xs text-zinc-400">Abra o WhatsApp, Dispositivos conectados e escaneie o QR Code.</p></div> : <p className="mt-3 text-xs text-zinc-400">{estado.status === "CONECTADO" ? "WhatsApp conectado e pronto para envios reais." : "Solicite o QR Code para conectar a instância."}</p>}<Button className="mt-4 w-full" size="sm" onClick={() => requisitar("reconnect")} disabled={carregando}>{carregando ? <Loader2 className="animate-spin" size={14} /> : <QrCode size={14} />} Reconectar e gerar QR Code</Button></div>;
}
