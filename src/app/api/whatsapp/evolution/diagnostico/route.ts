import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function assinatura(chave: string | undefined) {
  const valor = chave || "";
  return { keyLength: valor.length, keyStart: valor.slice(0, 6), keyEnd: valor.slice(-6) };
}
function chaveMascarada(chave: string | undefined) {
  const dados = assinatura(chave);
  return `${dados.keyStart}…${dados.keyEnd} (${dados.keyLength} caracteres)`;
}
function autorizado(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") return true;
  const token = process.env.EVOLUTION_DIAGNOSTIC_TOKEN;
  return Boolean(token && request.headers.get("x-evolution-diagnostic-token") === token);
}

export async function GET(request: NextRequest) {
  if (!autorizado(request)) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  const url = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;
  const base = { url: url || null, instance: instance || null, ...assinatura(apiKey) };
  if (!url || !apiKey || !instance) return NextResponse.json({ ...base, error: "Variáveis Evolution ausentes." }, { status: 500 });

  const endpoint = `${url}/instance/fetchInstances`;
  const headers = { apikey: apiKey };
  console.info("[Evolution diagnóstico] requisição", { url: endpoint, method: "GET", headers: { apikey: chaveMascarada(apiKey) } });
  try {
    const resposta = await fetch(endpoint, { method: "GET", headers, cache: "no-store", signal: AbortSignal.timeout(15_000) });
    const body = await resposta.text();
    console.info("[Evolution diagnóstico] resposta", { url: endpoint, method: "GET", httpStatus: resposta.status, body });
    return NextResponse.json({ ...base, endpoint, method: "GET", sentHeaders: { apikey: chaveMascarada(apiKey) }, httpStatus: resposta.status, body });
  } catch (error) {
    const value = error as { name?: string; message?: string; stack?: string; cause?: unknown };
    console.error("[Evolution diagnóstico] erro", { url: endpoint, method: "GET", headers: { apikey: chaveMascarada(apiKey) }, name: value.name, message: value.message, stack: value.stack, cause: value.cause });
    return NextResponse.json({ ...base, endpoint, method: "GET", sentHeaders: { apikey: chaveMascarada(apiKey) }, error: { name: value.name, message: value.message, stack: value.stack, cause: value.cause } }, { status: 500 });
  }
}
