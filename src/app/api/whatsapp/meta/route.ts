import { NextRequest, NextResponse } from "next/server";
import { authStatus, requireAdmin } from "@/lib/api-admin-auth";
import { metaReadiness } from "@/lib/whatsapp/meta-cloud";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try { await requireAdmin(request); const state = metaReadiness(); return NextResponse.json({ provider: "META_CLOUD_API", enabled: false, configured: state.configured, missing: state.missing, message: "Estrutura preparada; conexão e envio bloqueados." }); }
  catch (error) { return NextResponse.json({ error: "Acesso negado." }, { status: authStatus(error) }); }
}

export async function POST(request: NextRequest) {
  try { await requireAdmin(request); return NextResponse.json({ error: "META_CLOUD_API desativada. Nenhuma mensagem foi enviada." }, { status: 503 }); }
  catch (error) { return NextResponse.json({ error: "Acesso negado." }, { status: authStatus(error) }); }
}
