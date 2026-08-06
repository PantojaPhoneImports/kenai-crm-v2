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
  const headers = new Headers(init.headers);
  // Evolution API v2.3.7 exige exatamente o header `apikey`.
  headers.set("apikey", apiKey.trim());
  headers.set("Content-Type", "application/json");
  console.info("[Evolution] requisição", { url, endpoint, method, authHeader: "apikey", apiKeyConfigured: Boolean(apiKey) });
  try {
    const resposta = await fetch(url, { ...init, headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
    const texto = await resposta.text(); let data: any = {};
    try { data = texto ? JSON.parse(texto) : {}; } catch { data = { rawBody: texto }; }
    console.info("[Evolution] resposta", { endpoint, method, authHeader: "apikey", httpStatus: resposta.status, body: logBody(data) });
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
function estado(data: any) { const value = data?.instance?.state || data?.instance?.status || data?.instance?.connectionStatus || data?.connectionStatus || data?.state || "close"; return ["open", "connected"].includes(String(value).toLowerCase()) ? "CONECTADO" : ["connecting", "qrcode"].includes(String(value).toLowerCase()) ? "CONECTANDO" : "DESCONECTADO"; }
function qr(data: any) { return data?.qrcode?.base64 || data?.base64 || data?.qrcode || null; }
function mensagemResposta(resposta: EvolutionResponse) { return typeof resposta.data?.message === "string" ? resposta.data.message : JSON.stringify(logBody(resposta.data)); }
function mensagemEvolution(data: unknown) {
  const resposta = data as { response?: { message?: unknown }; message?: unknown; error?: unknown };
  const mensagem = resposta?.response?.message ?? resposta?.message ?? resposta?.error ?? data;
  return typeof mensagem === "string" ? mensagem : JSON.stringify(mensagem);
}
type StatusEntrega = "ENVIADA" | "PENDENTE" | "ERRO";
function statusEntrega(valor: unknown): StatusEntrega {
  const status = String(valor || "PENDING").toUpperCase();
  if (["SENT", "DELIVERED", "READ", "SUCCESS"].includes(status)) return "ENVIADA";
  if (["ERROR", "FAILED", "REVOKED"].includes(status)) return "ERRO";
  return "PENDENTE";
}
function ultimoStatusDaMensagem(data: unknown) {
  const resposta = data as { messages?: { records?: Array<{ MessageUpdate?: Array<{ status?: unknown }>; messageUpdate?: Array<{ status?: unknown }> }> }; records?: Array<{ MessageUpdate?: Array<{ status?: unknown }>; messageUpdate?: Array<{ status?: unknown }> }> };
  const registros = resposta?.messages?.records || resposta?.records || [];
  const atualizacoes = registros[0]?.MessageUpdate || registros[0]?.messageUpdate || [];
  return atualizacoes.at(-1)?.status || null;
}
async function confirmarEntrega(instancia: string, messageId: string) {
  let consulta: EvolutionResponse | null = null;
  for (const espera of [0, 1_000, 2_000, 3_000]) {
    if (espera) await new Promise(resolve => setTimeout(resolve, espera));
    consulta = await evolution(`/chat/findMessages/${encodeURIComponent(instancia)}`, { method: "POST", body: JSON.stringify({ where: { key: { id: messageId } } }) });
    if (consulta.status >= 400) break;
    const status = ultimoStatusDaMensagem(consulta.data);
    if (status) return { status: statusEntrega(status), statusEvolution: String(status).toUpperCase(), response: consulta.data };
  }
  return { status: "PENDENTE" as const, statusEvolution: "PENDING", response: consulta?.data || null };
}
function instanciaDaLista(data: any, nome: string) {
  const lista = Array.isArray(data) ? data : (Array.isArray(data?.instances) ? data.instances : []);
  return lista.find((item: any) => (item?.instance?.instanceName || item?.instanceName || item?.name) === nome) || null;
}
function jaExiste(resposta: EvolutionResponse) { return resposta.status === 409 || /already exists|already exist|instance exists|já existe/i.test(mensagemResposta(resposta)); }
async function validarAutenticacao() {
  console.info("[Evolution] teste de autenticação", { endpoint: "/instance/fetchInstances", method: "GET", authHeader: "apikey" });
  const resultado = await evolution("/instance/fetchInstances");
  if (resultado.status === 401) throw new Error(`Autenticação Evolution recusada: HTTP 401 — ${mensagemResposta(resultado)}. A versão 2.3.7 exige o header apikey; confira o valor de EVOLUTION_API_KEY na Vercel.`);
  return resultado;
}
async function garantirInstancia() {
  const { instancia } = configuracao();
  // Em v2.3.x, fetchInstances diferencia "instância inexistente" de "rota inexistente".
  const lista = await validarAutenticacao();
  if (lista.status === 200) {
    const encontrada = instanciaDaLista(lista.data, instancia);
    if (encontrada) { console.info("[Evolution] instância localizada em fetchInstances", { instance: instancia }); return { data: encontrada, criada: false }; }
  } else if (lista.status === 401 || lista.status === 403) {
    throw new Error(`Não foi possível listar instâncias: HTTP ${lista.status} — ${mensagemResposta(lista)}`);
  } else {
    // Compatibilidade com proxies/versões que não expõem fetchInstances.
    console.info("[Evolution] fetchInstances indisponível; tentando endpoints alternativos", { status: lista.status, body: logBody(lista.data) });
    for (const endpoint of [`/instance/${encodeURIComponent(instancia)}`, `/instances/${encodeURIComponent(instancia)}`, `/instance/connectionState/${encodeURIComponent(instancia)}`]) {
      const atual = await evolution(endpoint);
      if (atual.status >= 200 && atual.status < 300) return { data: atual.data, criada: false };
      if (atual.status === 401 || atual.status === 403) throw new Error(`Falha de autenticação em ${endpoint}: HTTP ${atual.status} — ${mensagemResposta(atual)}`);
    }
  }
  const criada = await evolution("/instance/create", { method: "POST", body: JSON.stringify({ instanceName: instancia, integration: "WHATSAPP-BAILEYS", qrcode: true }) });
  if (criada.status >= 200 && criada.status < 300) return { data: criada.data, criada: true };
  // A API pode responder conflito se outra sessão criou a instância entre a listagem e o POST.
  if (jaExiste(criada)) { console.info("[Evolution] instância já existia durante POST create; conectando sem recriar", { instance: instancia }); return { data: { instance: { instanceName: instancia, status: "connecting" } }, criada: false }; }
  throw new Error(`Não foi possível criar a instância Evolution: HTTP ${criada.status} — ${mensagemResposta(criada)}`);
}
async function conexao(obterQr = false) {
  const { instancia } = configuracao(); const resultado = await garantirInstancia(); let dados = resultado.data; let codigoQr = qr(dados);
  if (obterQr && !codigoQr) { const resposta = await evolution(`/instance/connect/${encodeURIComponent(instancia)}`); if (resposta.status >= 400) throw new Error(resposta.data?.message || "Não foi possível obter o QR Code."); dados = resposta.data; codigoQr = qr(dados); }
  return { instance: instancia, status: estado(dados), qrCode: codigoQr, criada: resultado.criada };
}
export async function GET() { try { return NextResponse.json(await conexao(true)); } catch (error) { return NextResponse.json(erroComDiagnostico(error), { status: 500 }); } }
type EnvioEvolution = { telefone?: unknown; mensagem?: unknown; cliente?: unknown; clienteId?: unknown };
async function enviarMensagem(body: EnvioEvolution) {
  const telefoneSalvo = String(body.telefone || "");
  const telefone = telefoneSalvo.replace(/\D/g, "");
  const mensagem = String(body.mensagem || "").trim();
  if (!telefone || !mensagem) return NextResponse.json({ error: "Telefone e mensagem são obrigatórios." }, { status: 400 });

  const atual = await conexao(false);
  if (atual.status !== "CONECTADO") return NextResponse.json({ error: "A instância Evolution não está conectada." }, { status: 409 });

  const numero = telefone.startsWith("55") ? telefone : `55${telefone}`;
  const endpoint = `/message/sendText/${encodeURIComponent(atual.instance)}`;
  const payload = { number: numero, text: mensagem, linkPreview: true };
  console.info("[Evolution] envio", { cliente: body.cliente || null, documentoFirestore: body.clienteId || null, telefoneSalvo, telefoneNormalizado: telefone, telefoneEnviado: numero, endpoint, payload });
  const enviada = await evolution(endpoint, { method: "POST", body: JSON.stringify(payload) });
  console.info("[Evolution] resposta envio", { endpoint: enviada.endpoint, method: enviada.method, httpStatus: enviada.status, body: logBody(enviada.data) });
  console.info("[Evolution] resposta envio JSON", JSON.stringify({ endpoint: enviada.endpoint, method: enviada.method, httpStatus: enviada.status, body: enviada.data }));
  if (enviada.status >= 400) return NextResponse.json({ error: mensagemEvolution(enviada.data), evolution: enviada.data, diagnostic: { endpoint: enviada.endpoint, method: enviada.method, httpStatus: enviada.status, body: enviada.data } }, { status: enviada.status });

  const messageId = enviada.data?.key?.id;
  const confirmacao = messageId ? await confirmarEntrega(atual.instance, messageId) : { status: statusEntrega(enviada.data?.status), statusEvolution: String(enviada.data?.status || "PENDING").toUpperCase(), response: null };
  console.info("[Evolution] confirmação de entrega", JSON.stringify({ messageId: messageId || null, ...confirmacao }));
  return NextResponse.json({ status: confirmacao.status, provider: "EVOLUTION", evolution: { httpStatus: enviada.status, status: confirmacao.statusEvolution, endpoint: enviada.endpoint, messageId: messageId || null, response: logBody(enviada.data), delivery: logBody(confirmacao.response) } });
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json(); console.info("[Evolution] ação CRM", { action: body.action });
    if (body.action === "send") return enviarMensagem(body);
    if (["status", "connect", "test"].includes(body.action)) return NextResponse.json(await conexao(body.action === "connect"));
    if (body.action === "reconnect") { const { instancia } = configuracao(); await garantirInstancia(); const reinicio = await evolution(`/instance/restart/${encodeURIComponent(instancia)}`, { method: "POST" }); if (reinicio.status >= 400) throw new Error(reinicio.data?.message || "Não foi possível reiniciar a instância."); return NextResponse.json(await conexao(true)); }
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) { return NextResponse.json(erroComDiagnostico(error), { status: 500 }); }
}
