"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import Layout from "@/components/layout/Layout";
import EvolutionConnection from "@/components/cobranca/EvolutionConnection";
import AcessoRestritoCobranca from "@/components/cobranca/AcessoRestritoCobranca";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { obterConfiguracaoCobranca, salvarConfiguracaoCobranca } from "@/services/cobrancas";
import type { ConfiguracaoCobranca, ProviderWhatsapp } from "@/types/cobranca";
import { useAuth } from "@/contexts/AuthContext";
import { usuarioEhSocio } from "@/lib/socio";

const providers: Array<{ id: ProviderWhatsapp; nome: string; descricao: string }> = [
  { id: "WAME", nome: "WA.ME", descricao: "Abertura manual pelo WhatsApp Web." },
  { id: "EVOLUTION", nome: "Evolution API", descricao: "Provider atual; permanece ativo durante a preparação." },
  { id: "META_CLOUD_API", nome: "Meta Cloud API", descricao: "Arquitetura oficial preparada, porém desativada." },
  { id: "Z_API", nome: "Z-API", descricao: "Provider não configurado." },
  { id: "ULTRAMSG", nome: "UltraMsg", descricao: "Provider não configurado." },
];
const padrao: ConfiguracaoCobranca = { providerAtivo: "WAME", horario: "08:00", empresa: "Pantoja Phone Imports", telefone: "", mensagemPadrao: "", assinatura: "", diasAntecedencia: [3, 1, 0], providers: {} };

function semCredenciais(config: ConfiguracaoCobranca) { const { providers: _providers, ...publica } = config; return publica as ConfiguracaoCobranca; }

export default function ConfiguracoesCobrancaPage() {
  const { usuario, loading: carregandoUsuario } = useAuth();
  const [config, setConfig] = useState<ConfiguracaoCobranca>(padrao);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState<ProviderWhatsapp | null>(null);
  const [aviso, setAviso] = useState("");
  useEffect(() => { if (!usuario || usuarioEhSocio(usuario)) { setCarregando(false); return; } obterConfiguracaoCobranca().then(valor => { if (valor) setConfig({ ...padrao, ...valor, providers: {} }); }).finally(() => setCarregando(false)); }, [usuario]);
  async function ativar(id: ProviderWhatsapp) {
    if (id !== "EVOLUTION" && id !== "WAME") { setAviso("Provider bloqueado até configuração e migração expressamente autorizadas."); return; }
    setSalvando(id); try { const proxima = { ...config, providerAtivo: id }; await salvarConfiguracaoCobranca(semCredenciais(proxima)); setConfig(proxima); setAviso(`${providers.find(p => p.id === id)?.nome} está ativo.`); } finally { setSalvando(null); }
  }
  async function salvarGerais() { setSalvando(config.providerAtivo); try { await salvarConfiguracaoCobranca(semCredenciais(config)); setAviso("Parâmetros salvos."); } finally { setSalvando(null); } }
  if (carregandoUsuario || carregando) return <Layout><div className="h-64 animate-pulse rounded-2xl bg-zinc-900" /></Layout>;
  if (usuarioEhSocio(usuario)) return <Layout><AcessoRestritoCobranca /></Layout>;
  return <Layout><div className="space-y-6">
    <div><h1 className="text-3xl font-bold text-white">Configurações da Cobrança</h1><p className="mt-2 text-zinc-400">Credenciais são exclusivamente server-side e nunca são digitadas ou armazenadas nesta tela.</p></div>
    {aviso && <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{aviso}</div>}
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{providers.map(item => { const ativo = config.providerAtivo === item.id; const bloqueado = !["EVOLUTION", "WAME"].includes(item.id); return <article key={item.id} className={`rounded-2xl border bg-zinc-900 p-5 ${ativo ? "border-emerald-400/70" : "border-zinc-800"}`}><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-white">{item.nome}</h2><p className="mt-1 text-xs text-zinc-400">{item.descricao}</p></div><span className={`rounded-full px-2 py-1 text-xs ${ativo ? "bg-emerald-500/15 text-emerald-300" : bloqueado ? "bg-amber-500/15 text-amber-300" : "bg-zinc-800 text-zinc-400"}`}>{ativo ? "ATIVO" : bloqueado ? "DESATIVADO" : "DISPONÍVEL"}</span></div>{item.id === "EVOLUTION" && <div className="mt-4"><EvolutionConnection /></div>}{item.id === "META_CLOUD_API" && <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200">Aguardando aprovação do número e variáveis seguras na Vercel. Nenhum número será conectado nesta etapa.</div>}<Button className="mt-4" size="sm" onClick={() => ativar(item.id)} disabled={bloqueado || salvando === item.id}>{salvando === item.id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />} Ativar</Button></article>; })}</section>
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><h2 className="font-semibold text-white">Parâmetros gerais</h2><div className="mt-4 grid gap-3 md:grid-cols-2"><Input value={config.horario} onChange={e => setConfig({ ...config, horario: e.target.value })} placeholder="Horário" /><Input value={config.empresa} onChange={e => setConfig({ ...config, empresa: e.target.value })} placeholder="Empresa" /><Input value={config.mensagemPadrao} onChange={e => setConfig({ ...config, mensagemPadrao: e.target.value })} placeholder="Mensagem padrão" /><Input value={config.assinatura} onChange={e => setConfig({ ...config, assinatura: e.target.value })} placeholder="Assinatura" /></div><Button className="mt-4" onClick={salvarGerais}><Save size={16} /> Salvar parâmetros</Button></section>
  </div></Layout>;
}
