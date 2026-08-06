"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Clock3, Loader2, MessageCircle, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { usuarioEhSocio } from "@/lib/socio";
import { atualizarCobranca, criarCobranca, jaExisteCobrancaHoje, obterConfiguracaoCobranca, registrarLog } from "@/services/cobrancas";
import { whatsappProvider } from "@/lib/whatsapp/providers";
import type { ProviderWhatsapp } from "@/types/cobranca";

type Filtro = "TODOS" | "HOJE" | "AMANHA" | "ATRASO" | "ENVIADOS" | "PENDENTES";
type LogCobranca = { cliente?: string; telefone?: string; data?: string; tipo?: string; resultado?: string; provider?: string; mensagem?: string; erro?: string };
type ResultadoEnvio = "enviado" | "ignorado" | "erro";
type Progresso = { atual: number; total: number; enviados: number; ignorados: number; erros: number };

const modelos: Record<string, string> = {
  "3 dias": "Olá, {{cliente}}! Seu pagamento de {{valor}} referente a {{produto}} vence em {{vencimento}}. Obrigado, {{empresa}}.",
  hoje: "Olá, {{cliente}}! A parcela {{parcela}}/{{totalParcelas}} de {{produto}}, no valor de {{valor}}, vence hoje. {{empresa}}.",
  "1 dia de atraso": "Olá, {{cliente}}! Identificamos que a parcela de {{produto}} no valor de {{valor}} venceu em {{vencimento}}. Fale conosco para regularizar. {{empresa}}.",
  "7 dias de atraso": "Olá, {{cliente}}! Sua parcela de {{produto}} no valor de {{valor}} está há 7 dias em atraso. Por favor, entre em contato. {{empresa}}.",
};

const nomeProvider: Record<ProviderWhatsapp, string> = { WAME: "🟡 WA.ME", EVOLUTION: "🟢 Evolution", META_CLOUD: "🔴 Meta Cloud", Z_API: "🔴 Z-API", ULTRAMSG: "🔴 UltraMsg" };
function modoProvider(provider: ProviderWhatsapp) { return provider === "WAME" ? "Envio manual (WA.ME)" : provider === "EVOLUTION" ? "Envio automático (Evolution API)" : "Provider não configurado"; }
function vencimento(p: any) { return p.vencimento?.seconds ? new Date(p.vencimento.seconds * 1000) : new Date(p.vencimento); }
function categoria(p: any) { if (p.status === "PAGA") return ""; const hoje = new Date(); hoje.setHours(0, 0, 0, 0); const dias = Math.ceil((vencimento(p).setHours(0, 0, 0, 0) - hoje.getTime()) / 86400000); return dias < 0 ? "ATRASO" : dias === 0 ? "HOJE" : dias === 1 ? "AMANHA" : dias <= 3 ? "3DIAS" : ""; }
function tipoMensagem(p: any) { const atual = categoria(p); return atual === "ATRASO" ? (Math.ceil((Date.now() - vencimento(p).getTime()) / 86400000) >= 7 ? "7 dias de atraso" : "1 dia de atraso") : atual === "HOJE" ? "hoje" : "3 dias"; }
function hoje(valor?: string) { return !!valor && new Date(valor).toDateString() === new Date().toDateString(); }

export default function CentralWhatsapp() {
  const { usuario } = useAuth();
  const ehSocio = usuarioEhSocio(usuario);
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [logs, setLogs] = useState<LogCobranca[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("TODOS");
  const [busca, setBusca] = useState("");
  const [enviando, setEnviando] = useState<string | null>(null);
  const [enviadosAgora, setEnviadosAgora] = useState<string[]>([]);
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [providerAtivo, setProviderAtivo] = useState<ProviderWhatsapp>("WAME");
  const [progresso, setProgresso] = useState<Progresso | null>(null);

  useEffect(() => {
    if (!usuario) return;
    let ativo = true;
    const consulta = ehSocio
      ? query(collection(db, "parcelas"), where("socioId", "==", usuario.socioId))
      : query(collection(db, "parcelas"), orderBy("vencimento", "asc"));
    const cancelar = onSnapshot(consulta, async s => {
      const parcelasAtivas = s.docs.map(d => ({ id: d.id, ...d.data() })).filter((p: any) => p.status !== "PAGA");
      const parcelasComTelefone = await Promise.all(parcelasAtivas.map(async (p: any) => {
        if (!p.clienteId) return { ...p, telefoneCliente: "", clienteTelefone: "", telefone: "" };
        try {
          const cliente = await getDoc(doc(db, "clientes", p.clienteId));
          const telefoneCliente = String(cliente.data()?.telefone || "");
          return { ...p, telefoneCliente, clienteTelefone: telefoneCliente, telefone: telefoneCliente };
        } catch (error) {
          console.error("[Cobranca WhatsApp] erro ao consultar telefone do cliente", { cliente: p.clienteNome, clienteId: p.clienteId, error });
          return { ...p, telefoneCliente: "", clienteTelefone: "", telefone: "", erroTelefoneCliente: true };
        }
      }));
      if (ativo) { setParcelas(parcelasComTelefone); setCarregando(false); }
    }, () => { if (ativo) setCarregando(false); });
    return () => { ativo = false; cancelar(); };
  }, [usuario, ehSocio]);
  useEffect(() => { if (!usuario || ehSocio) { setLogs([]); return; } return onSnapshot(query(collection(db, "cobrancaLogs"), orderBy("data", "desc")), s => setLogs(s.docs.map(d => d.data() as LogCobranca)), () => setLogs([])); }, [usuario, ehSocio]);
  useEffect(() => { if (!usuario || ehSocio) return; obterConfiguracaoCobranca().then(config => setProviderAtivo(config?.providerAtivo || "WAME")).catch(error => console.error("[Cobrança WhatsApp] erro ao descobrir provider ativo", error)); }, [usuario, ehSocio]);

  const telefoneExibido = (p: any) => p.telefoneCliente || p.clienteTelefone || p.telefone || "";
  const logDoCliente = (p: any) => logs.filter(log => log.cliente === p.clienteNome || (!!telefoneExibido(p) && log.telefone === telefoneExibido(p)));
  const resumo = useMemo(() => { const enviados = logs.filter(log => hoje(log.data) && log.resultado === "ENVIADA"); const erros = logs.filter(log => hoje(log.data) && log.resultado === "ERRO"); const tentativas = enviados.length + erros.length; return { ATRASO: parcelas.filter(p => categoria(p) === "ATRASO"), HOJE: parcelas.filter(p => categoria(p) === "HOJE"), AMANHA: parcelas.filter(p => categoria(p) === "AMANHA"), ENVIADOS: enviados, ERROS: erros, PENDENTES: parcelas.filter(p => !logDoCliente(p).some(log => hoje(log.data))), TAXA: tentativas ? Math.round((enviados.length / tentativas) * 100) : 0 }; }, [parcelas, logs]);
  const lista = useMemo(() => parcelas.filter(p => { const historico = logDoCliente(p); const passa = filtro === "TODOS" || (filtro === "PENDENTES" ? !historico.some(log => hoje(log.data)) : filtro === "ENVIADOS" ? historico.some(log => hoje(log.data) && log.resultado === "ENVIADA") : categoria(p) === filtro); return passa && [p.clienteNome, telefoneExibido(p), p.produtoNome, p.imei, p.cor, p.socioNome].filter(Boolean).join(" ").toLowerCase().includes(busca.toLowerCase()); }), [parcelas, logs, filtro, busca]);

  const marcarEnviado = (id: string) => { setEnviadosAgora(atual => [...new Set([...atual, id])]); window.setTimeout(() => setEnviadosAgora(atual => atual.filter(item => item !== id)), 3_000); };
  const mensagemErro = (error: unknown) => error instanceof Error ? error.message : "Erro interno.";
  const toastErro = (error: unknown) => { const mensagem = mensagemErro(error); if (/não está conectada|nao esta conectada/i.test(mensagem)) toast.error("Evolution desconectada."); else if (/ainda não está configurado|evolution não configurada/i.test(mensagem)) toast.error("Provider não configurado."); else toast.error("Erro interno."); };

  async function enviar(p: any, silencioso = false): Promise<ResultadoEnvio> {
    if (ehSocio) return "ignorado";
    let documentoCliente;
    let telefone = "";
    try {
      documentoCliente = p.clienteId ? await getDoc(doc(db, "clientes", p.clienteId)) : null;
      telefone = String(documentoCliente?.data()?.telefone || "");
    } catch (error) {
      console.error("[Cobranca WhatsApp] erro ao consultar telefone para envio", { cliente: p.clienteNome, clienteId: p.clienteId, error });
      setAviso("Nao foi possivel consultar o telefone do cliente.");
      if (!silencioso) toast.error("Nao foi possivel consultar o telefone do cliente.");
      return "erro";
    }
    console.info("[Cobrança WhatsApp] telefone resolvido", {
      cliente: p.clienteNome,
      documentoFirestore: p.clienteId || null,
      telefoneSalvo: telefone || null,
      telefoneParcela: p.clienteTelefone || p.telefone || null,
    });
    if (!telefone) { console.warn("[Cobrança WhatsApp] envio ignorado: cliente sem telefone", { cliente: p.clienteNome, parcela: p.parcela }); if (!silencioso) toast.error("Cliente sem telefone."); return "ignorado"; }

    const inicio = performance.now();
    let provider: ProviderWhatsapp = providerAtivo;
    let cobrancaId: string | null = null;
    setEnviando(p.id);
    try {
      const tipo = tipoMensagem(p);
      if (await jaExisteCobrancaHoje(p.clienteId, tipo)) { const texto = "Já existe uma cobrança enviada desse tipo para este cliente hoje."; setAviso(texto); console.info("[Cobrança WhatsApp] envio ignorado", { motivo: texto, cliente: p.clienteNome, telefone, parcela: p.parcela }); if (!silencioso) toast.info(texto); return "ignorado"; }

      const config = await obterConfiguracaoCobranca();
      provider = config?.providerAtivo || "WAME";
      setProviderAtivo(provider);
      const valores: Record<string, string> = { cliente: p.clienteNome || "", produto: p.produtoNome || "", valor: Number(p.valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), parcela: String(p.parcela || ""), totalParcelas: String(p.totalParcelas || ""), vencimento: vencimento(p).toLocaleDateString("pt-BR"), empresa: config?.empresa || "Pantoja Phone Imports" };
      const mensagem = (modelos[tipo] || config?.mensagemPadrao || "").replace(/{{(.*?)}}/g, (_, chave) => valores[chave] || "");
      console.info("[Cobrança WhatsApp] iniciando envio", { provider, telefone, cliente: p.clienteNome, parcela: p.parcela, mensagem, modo: modoProvider(provider) });
      const criada = await criarCobranca({ clienteId: p.clienteId, cliente: p.clienteNome || "", telefone, produto: p.produtoNome || "", parcela: Number(p.parcela), valor: Number(p.valor), vencimento: vencimento(p).toISOString(), tipoMensagem: tipo, status: "PENDENTE", criadoEm: new Date().toISOString(), provider, tentativas: 1, responsavel: usuario?.nome, mensagem });
      cobrancaId = criada.id;
      const resultado = await whatsappProvider.send({ telefone, mensagem, provider, cliente: p.clienteNome, clienteId: p.clienteId });
      const dataEnvio = new Date().toISOString();
      await atualizarCobranca(cobrancaId, { status: resultado.status === "ENVIADA" ? "ENVIADA" : "PENDENTE", enviadoEm: dataEnvio });
      await registrarLog({ cobrancaId, data: dataEnvio, usuario: usuario?.nome || "", cliente: p.clienteNome || "", telefone, provider, mensagem, tipo, resultado: resultado.status });
      console.info("[Cobrança WhatsApp] envio concluído", { provider, telefone, cliente: p.clienteNome, parcela: p.parcela, mensagem, tempoMs: Math.round(performance.now() - inicio), respostaApi: resultado.response });
      marcarEnviado(p.id);
      const texto = provider === "WAME" ? "WhatsApp aberto." : "Mensagem enviada.";
      setAviso(texto);
      if (!silencioso) toast.success(texto);
      return "enviado";
    } catch (error) {
      const dataErro = new Date().toISOString();
      if (cobrancaId) { await atualizarCobranca(cobrancaId, { status: "ERRO" }); await registrarLog({ cobrancaId, data: dataErro, usuario: usuario?.nome || "", cliente: p.clienteNome || "", telefone, provider, tipo: tipoMensagem(p), resultado: "ERRO", erro: mensagemErro(error) }); }
      console.error("[Cobrança WhatsApp] erro no envio", { provider, telefone, cliente: p.clienteNome, parcela: p.parcela, tempoMs: Math.round(performance.now() - inicio), erroCompleto: error });
      setAviso("Não foi possível enviar a cobrança.");
      if (!silencioso) toastErro(error);
      return "erro";
    } finally { setEnviando(null); }
  }

  async function enviarTodos() {
    if (ehSocio || !confirm(`Enviar ${lista.length} cobrança(s)?`)) return;
    let enviados = 0; let ignorados = 0; let erros = 0;
    setProgresso({ atual: 0, total: lista.length, enviados, ignorados, erros });
    for (let indice = 0; indice < lista.length; indice += 1) { const resultado = await enviar(lista[indice], true); if (resultado === "enviado") enviados += 1; else if (resultado === "ignorado") ignorados += 1; else erros += 1; setProgresso({ atual: indice + 1, total: lista.length, enviados, ignorados, erros }); }
    const resumoFinal = `${enviados} enviados • ${ignorados} ignorados • ${erros} erros`;
    setAviso(resumoFinal);
    toast.success(resumoFinal);
    window.setTimeout(() => setProgresso(null), 3_000);
  }

  const cards = [{ titulo: "Clientes em atraso", valor: resumo.ATRASO.length, filtro: "ATRASO" as Filtro, icone: AlertCircle }, { titulo: "Cobranças hoje", valor: resumo.HOJE.length, filtro: "HOJE" as Filtro, icone: Clock3 }, { titulo: "Cobranças amanhã", valor: resumo.AMANHA.length, filtro: "AMANHA" as Filtro, icone: Clock3 }, { titulo: "Mensagens enviadas hoje", valor: resumo.ENVIADOS.length, filtro: "ENVIADOS" as Filtro, icone: CheckCircle2 }, { titulo: "Falhas", valor: resumo.ERROS.length, filtro: "TODOS" as Filtro, icone: XCircle }, { titulo: "Pendentes", valor: resumo.PENDENTES.length, filtro: "PENDENTES" as Filtro, icone: Clock3 }, { titulo: "Taxa de sucesso", valor: `${resumo.TAXA}%`, filtro: "TODOS" as Filtro, icone: CheckCircle2 }];
  const colunas = ehSocio ? ["Cliente", "Telefone", "Produto", "Parcela", "Valor", "Vencimento", "Última cobrança", "Lembretes", "Status"] : ["Cliente", "Telefone", "Produto", "Sócio", "Parcela", "Valor", "Vencimento", "Última cobrança", "Lembretes", "Provider", "Tentativa", "WhatsApp"];

  if (carregando) return <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-zinc-900" />)}</div>;
  return <div className="space-y-6">
    {aviso && !ehSocio && <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-200">{aviso}</div>}
    {!ehSocio && <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm"><span className="text-zinc-400">Provider ativo:</span><strong className="text-white">{nomeProvider[providerAtivo]}</strong><span className="text-zinc-400">— {modoProvider(providerAtivo)}</span></div>}
    {progresso && <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100"><div className="mb-2 flex justify-between"><span>Enviando {progresso.atual} de {progresso.total}...</span><span>{progresso.enviados} enviados · {progresso.ignorados} ignorados · {progresso.erros} erros</span></div><div className="h-2 overflow-hidden rounded-full bg-zinc-800"><div className="h-full bg-amber-400 transition-all" style={{ width: `${progresso.total ? (progresso.atual / progresso.total) * 100 : 0}%` }} /></div></div>}
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{cards.map(({ titulo, valor, filtro: alvo, icone: Icon }) => <button onClick={() => setFiltro(alvo)} key={titulo} className={`rounded-xl border p-4 text-left ${filtro === alvo ? "border-amber-500 bg-amber-500/10" : "border-zinc-800 bg-zinc-900"}`}><Icon size={16} className="text-amber-300" /><p className="mt-2 text-xs text-zinc-400">{titulo}</p><p className="mt-1 text-2xl font-bold text-white">{valor}</p></button>)}</div>
    <div className="flex flex-col gap-3 sm:flex-row"><Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar cliente, telefone, produto, IMEI ou cor..." /><Button variant="outline" onClick={() => { setFiltro("TODOS"); setBusca(""); }}>Limpar filtros</Button>{!ehSocio && <Button onClick={enviarTodos} disabled={!lista.length || !!progresso}><Send size={16} /> Enviar para todos</Button>}</div>
    <div className="overflow-x-auto rounded-2xl border border-zinc-800"><table className="w-full min-w-[900px] text-sm"><thead className="bg-zinc-900 text-zinc-400"><tr>{colunas.map(x => <th key={x} className="p-3 text-left">{x}</th>)}</tr></thead><tbody>{lista.length ? lista.map(p => { const historico = logDoCliente(p); const ultimo = historico[0]; const estaEnviando = enviando === p.id; const enviadoAgora = enviadosAgora.includes(p.id); return <tr key={p.id} className="border-t border-zinc-800 align-top"><td className="p-3 text-white"><p>{p.clienteNome}</p></td><td className="p-3">{p.clienteTelefone || p.telefone || "-"}</td><td className="p-3">{p.produtoNome || "-"}</td>{!ehSocio && <td className="p-3">{p.socioNome || "-"}</td>}<td className="p-3">{p.parcela}/{p.totalParcelas}</td><td className="p-3 text-green-400">{Number(p.valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td><td className="p-3">{vencimento(p).toLocaleDateString("pt-BR")}</td><td className="p-3">{ultimo?.data ? new Date(ultimo.data).toLocaleString("pt-BR") : "-"}</td><td className="p-3">{historico.length}</td>{ehSocio ? <td className="p-3">{ultimo?.resultado || "PENDENTE"}</td> : <><td className="p-3">{ultimo?.provider || "-"}</td><td className="p-3">{ultimo?.resultado || "PENDENTE"}</td><td className="p-3"><Button size="sm" onClick={() => enviar(p)} disabled={estaEnviando || !!progresso}>{estaEnviando ? <Loader2 className="animate-spin" size={16} /> : <MessageCircle size={16} />}{estaEnviando ? "Enviando..." : enviadoAgora ? "Enviado" : "Enviar"}</Button></td></>}</tr>; }) : <tr><td colSpan={colunas.length} className="p-12 text-center text-zinc-400">Nenhuma cobrança encontrada com estes filtros.</td></tr>}</tbody></table></div>
  </div>;
}
