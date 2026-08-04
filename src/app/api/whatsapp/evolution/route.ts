import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
type EvolutionResponse = { status: number; data: any; endpoint: string; method: string };

function diagnosticoErro(error: unknown, etapa: string) {
  const value = error as { name?: string; message?: string; stack?: string; cause?: unknown };
  const cause = value?.cause as { name?: string; message?: string; code?: string; errno?: string; syscall?: string; address?: string; port?: number } | undefined;
  return { etapa, name: value?.name || "Error", message: value?.message || String(error), stack: value?.stack || null, cause: cause ? { name: cause.name, message: cause.message, code: cause.code, errno: cause.errno, syscall: cause.syscall, address: cause.address, port: cause.port } : null };
}
function logBody(data: any) {
  if (!data || typeof data !== "object") return data;
  const clone = { ...data };
  if (clone.qrcode?.base64) clone.qrcode = { ...clone.qrcode, base64: "[QR_CODE_OMITTED]" };
  if (typeof clone.base64 === "string") clone.base64 = "[BASE64_OMITTED]";
  return clone;
}
function configuracao() {
  const url = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instancia = process.env.EVOLUTION_INSTANCE;
  console.info("[Evolution] configuração", { url: url || "NÃO DEFINIDA", instance: instancia || "NÃO DEFINIDA", apiKeyConfigured: Boolean(apiKey) });
  if (!url || !apiKey || !instancia) throw new Error("Evolution não configurada. Defina EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE na Vercel.");
  return { url, apiKey, instancia };
}
async function requisicao(url: string, apiKey: string, endpoint: string, init: RequestInit): Promise<EvolutionResponse> {
  const method = init.method || "GET";
  console.info("[Evolution] requisição", { url, endpoint, method });
  try {
    const resposta = await fetch(url, { ...init, headers: { apikey: apiKey, "Content-Type": "application/json", ...init.headers }, cache: "no-store", signal: AbortSignal.timeout(15_000) });
    const texto = await resposta.text(); let data: any = {};
    try { data = texto ? JSON.parse(texto) : {}; } catch { data = { rawBody: texto }; }
    console.info("[Evolution] resposta", { endpoint, method, httpStatus: resposta.status, body: logBody(data) });
    return { status: resposta.status, data, endpoint, method };
  } catch (error) {
    const detalhe = diagnosticoErro(error, "src/app/api/whatsapp/evolution/route.ts:requisicao:fetch");
    console.error("[Evolution] fetch failed", { url, endpoint, method, ...detalhe });
    const completo = new Error(`fetch failed em ${endpoint}: ${detalhe.message}`);
    (completo as Error & { diagnostic?: unknown }).diagnostic = { url, endpoint, method, ...detalhe };
    throw completo;
  }
}
async function evolution(path: string, init: RequestInit = {}): Promise<EvolutionResponse> {
  const { url, apiKey } = configuracao();
  const primeiro = await requisicao(`${url}${path}`, apiKey, path, init);
  // Evolution v2 pode estar atrás de um proxy que publica a API sob /api/v1.
  if (primeiro.status !== 404 || url.includes("/api/v1")) return primeiro;
  const alternativo = `/api/v1${path}`;
  console.info("[Evolution] endpoint padrão retornou 404; tentando compatibilidade v2", { endpoint: alternativo });
  return requisicao(`${url}${alternativo}`, apiKey, alternativo, init);
}
function erroComDiagnostico(error: unknown) {
  const value = error as Error & { diagnostic?: unknown };
  return { error: value?.message || String(error), diagnostic: value?.diagnostic || diagnosticoErro(error, "src/app/api/whatsapp/evolution/route.ts") };
}
function estado(data: any) { const value = data?.instance?.state || data?.instance?.status || data?.state || "close"; return value === "open" ? "CONECTADO" : value === "connecting" ? "CONECTANDO" : "DESCONECTADO"; }
function qr(data: any) { return data?.qrcode?.base64 || data?.base64 || data?.qrcode || null; }
async function garantirInstancia() {
  const { instancia } = configuracao(); const atual = await evolution(`/instance/connectionState/${encodeURIComponent(instancia)}`);
  if (atual.status !== 404) { if (atual.status >= 400) throw new Error(atual.data?.message || "Não foi possível consultar a instância Evolution."); return { data: atual.data, criada: false }; }
  const criada = await evolution("/instance/create", { method: "POST", body: JSON.stringify({ instanceName: instancia, integration: "WHATSAPP-BAILEYS", qrcode: true }) });
  if (criada.status >= 400) throw new Error(criada.data?.message || "Não foi possível criar a instância Evolution."); return { data: criada.data, criada: true };
}
async function conexao(obterQr = false) {
  const { instancia } = configuracao(); const resultado = await garantirInstancia(); let dados = resultado.data; let codigoQr = qr(dados);
  if (obterQr && !codigoQr) { const resposta = await evolution(`/instance/connect/${encodeURIComponent(instancia)}`); if (resposta.status >= 400) throw new Error(resposta.data?.message || "Não foi possível obter o QR Code."); dados = resposta.data; codigoQr = qr(dados); }
  return { instance: instancia, status: estado(dados), qrCode: codigoQr, criada: resultado.criada };
}
export async function GET() { try { return NextResponse.json(await conexao(true)); } catch (error) { return NextResponse.json(erroComDiagnostico(error), { status: 500 }); } }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json(); console.info("[Evolution] ação CRM", { action: body.action });
    if (["status", "connect", "test"].includes(body.action)) return NextResponse.json(await conexao(body.action === "connect"));
    if (body.action === "reconnect") { const { instancia } = configuracao(); await garantirInstancia(); const reinicio = await evolution(`/instance/restart/${encodeURIComponent(instancia)}`, { method: "POST" }); if (reinicio.status >= 400) throw new Error(reinicio.data?.message || "Não foi possível reiniciar a instância."); return NextResponse.json(await conexao(true)); }
    if (body.action === "send") { const telefone = String(body.telefone || "").replace(/\D/g, ""); const mensagem = String(body.mensagem || "").trim(); if (!telefone || !mensagem) return NextResponse.json({ error: "Telefone e mensagem são obrigatórios." }, { status: 400 }); const atual = await conexao(false); if (atual.status !== "CONECTADO") return NextResponse.json({ error: "A instância Evolution não está conectada." }, { status: 409 }); const numero = telefone.startsWith("55") ? telefone : `55${telefone}`; const enviada = await evolution(`/message/sendText/${encodeURIComponent(atual.instance)}`, { method: "POST", body: JSON.stringify({ number: numero, textMessage: { text: mensagem }, linkPreview: true }) }); if (enviada.status >= 400) return NextResponse.json({ error: enviada.data?.message || "Evolution recusou o envio.", diagnostic: { endpoint: enviada.endpoint, method: enviada.method, httpStatus: enviada.status, body: logBody(enviada.data) } }, { status: enviada.status }); return NextResponse.json({ status: "ENVIADA", provider: "EVOLUTION" }); }
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) { return NextResponse.json(erroComDiagnostico(error), { status: 500 }); }
}
