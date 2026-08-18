import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { authStatus, requireAdmin } from "@/lib/api-admin-auth";
import { adminFirestore } from "@/lib/firebase-admin";
import { resolverTelefoneWhatsapp } from "@/lib/telefone-whatsapp";
import { metaReadiness } from "@/lib/whatsapp/meta-cloud";
import { serverWhatsappProviders } from "@/lib/whatsapp/server-provider";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request); const state = metaReadiness();
    return NextResponse.json({
      provider: "META_CLOUD_API",
      enabled: state.enabled,
      configured: state.configured,
      sendingConfigured: state.sendingConfigured,
      webhookConfigured: state.webhookConfigured,
      ready: state.ready,
      missing: state.missing,
      sendingMissing: state.sendingMissing,
      webhookMissing: state.webhookMissing,
      activationMissing: state.activationMissing,
      webhookUrl: `${request.nextUrl.origin}/api/whatsapp/meta/webhook`,
      message: state.ready
        ? "Meta Cloud API pronta para ativação."
        : "A configuração server-side da Meta ainda está incompleta.",
    });
  } catch (error) { return NextResponse.json({ error: "Acesso negado." }, { status: authStatus(error) }); }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request); const body = await request.json();
    if (body.action === "activate-provider") {
      const state = metaReadiness();
      if (!state.ready) return NextResponse.json({ error: "META_CLOUD_API_NOT_READY", missing: state.missing }, { status: 409 });
      const db = adminFirestore();
      const snapshot = await db.collection("configuracoesCobranca").limit(1).get();
      const ref = snapshot.empty ? db.collection("configuracoesCobranca").doc() : snapshot.docs[0].ref;
      await ref.set({ providerAtivo: "META_CLOUD_API", atualizadoPor: admin.uid, atualizadoEm: FieldValue.serverTimestamp() }, { merge: true });
      return NextResponse.json({ ok: true, provider: "META_CLOUD_API" });
    }
    if (body.action !== "send-template") return NextResponse.json({ error: "Ação não permitida." }, { status: 400 });
    const clienteId = String(body.clienteId || ""), templateName = String(body.templateName || "");
    const allowed = ["kenai_lembrete_vencimento_3_dias", "kenai_vencimento_hoje", "kenai_parcela_atrasada_1_dia", "kenai_parcela_atrasada_7_dias"];
    if (!clienteId || !allowed.includes(templateName)) return NextResponse.json({ error: "Cliente ou template inválido." }, { status: 400 });
    const db = adminFirestore(); const cliente = await db.collection("clientes").doc(clienteId).get();
    if (!cliente.exists) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
    const telefone = resolverTelefoneWhatsapp(cliente.data());
    if (!telefone) return NextResponse.json({ error: "Cliente sem telefone WhatsApp." }, { status: 400 });
    const result = await serverWhatsappProviders.META_CLOUD_API.sendTemplate({ telefone, clienteId, templateName, languageCode: String(body.languageCode || "pt_BR"), parameters: Array.isArray(body.parameters) ? body.parameters.map(String) : [] });
    await db.collection("whatsappMensagens").doc(result.messageId).set({ provider: "META_CLOUD_API", direction: "OUTBOUND", source: "CRM_TEMPLATE", metaMessageId: result.messageId, clienteId, clienteNome: String(cliente.data()?.nome || ""), socioId: String(cliente.data()?.socioId || ""), telefone: telefone.replace(/\D/g, ""), type: "template", templateName, status: "PENDENTE", requestedBy: admin.uid, createdAt: FieldValue.serverTimestamp() });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha no envio Meta.";
    if (message.startsWith("META_")) return NextResponse.json({ error: message }, { status: 503 });
    return NextResponse.json({ error: "Acesso negado." }, { status: authStatus(error) });
  }
}
