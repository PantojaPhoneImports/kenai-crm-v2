import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
type EvolutionResponse = { status: number; data: any };

function configuracao() {
  const url = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instancia = process.env.EVOLUTION_INSTANCE;
  if (!url || !apiKey || !instancia) throw new Error("Evolution não configurada. Defina EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE na Vercel.");
  return { url, apiKey, instancia };
}
async function evolution(path: string, init: RequestInit = {}): Promise<EvolutionResponse> {
  const { url, apiKey } = configuracao();
  const resposta = await fetch(`${url}${path}`, { ...init, headers: { apikey: apiKey, "Content-Type": "application/json", ...init.headers }, cache: "no-store" });
  const texto = await resposta.text(); let data: any = {};
  try { data = texto ? JSON.parse(texto) : {}; } catch { data = { message: texto }; }
  return { status: resposta.status, data };
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
export async function GET() { try { return NextResponse.json(await conexao(true)); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Erro na Evolution." }, { status: 500 }); } }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (["status", "connect", "test"].includes(body.action)) return NextResponse.json(await conexao(body.action === "connect"));
    if (body.action === "reconnect") { const { instancia } = configuracao(); await garantirInstancia(); const reinicio = await evolution(`/instance/restart/${encodeURIComponent(instancia)}`, { method: "POST" }); if (reinicio.status >= 400) throw new Error(reinicio.data?.message || "Não foi possível reiniciar a instância."); return NextResponse.json(await conexao(true)); }
    if (body.action === "send") { const telefone = String(body.telefone || "").replace(/\D/g, ""); const mensagem = String(body.mensagem || "").trim(); if (!telefone || !mensagem) return NextResponse.json({ error: "Telefone e mensagem são obrigatórios." }, { status: 400 }); const atual = await conexao(false); if (atual.status !== "CONECTADO") return NextResponse.json({ error: "A instância Evolution não está conectada." }, { status: 409 }); const numero = telefone.startsWith("55") ? telefone : `55${telefone}`; const enviada = await evolution(`/message/sendText/${encodeURIComponent(atual.instance)}`, { method: "POST", body: JSON.stringify({ number: numero, textMessage: { text: mensagem }, linkPreview: true }) }); if (enviada.status >= 400) return NextResponse.json({ error: enviada.data?.message || "Evolution recusou o envio." }, { status: enviada.status }); return NextResponse.json({ status: "ENVIADA", provider: "EVOLUTION" }); }
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Erro na Evolution." }, { status: 500 }); }
}
