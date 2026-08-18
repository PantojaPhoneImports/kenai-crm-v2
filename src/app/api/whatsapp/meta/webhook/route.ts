import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";
import { crmStatusFromMeta, normalizedWhatsappNumber, validMetaSignature, validVerifyToken, type MetaDeliveryStatus } from "@/lib/whatsapp/meta-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Data = Record<string, unknown>;
const object = (value: unknown): Data => value && typeof value === "object" ? value as Data : {};
const array = (value: unknown): Data[] => Array.isArray(value) ? value.map(object) : [];

export async function GET(request: NextRequest) {
  const startedAt = performance.now();
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const verifyToken = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  const verified = mode === "subscribe" && verifyToken !== null && challenge !== null && validVerifyToken(verifyToken);
  const status = verified ? 200 : 403;

  console.info("[meta-webhook-verification]", {
    method: request.method,
    hasMode: mode !== null,
    modeIsSubscribe: mode === "subscribe",
    hasVerifyToken: verifyToken !== null,
    hasChallenge: challenge !== null,
    status,
    durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
    userAgent: request.headers.get("user-agent") || "",
  });

  if (verified) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new NextResponse(null, { status: 403 });
}

async function findClient(phone: string) {
  const db = adminFirestore(); const clients = await db.collection("clientes").get();
  return clients.docs.find(doc => { const data = doc.data(); return [data.telefone, data.telefone2].some(value => normalizedWhatsappNumber(value) === phone); }) || null;
}

async function persistInbound(message: Data, contact: Data) {
  const phone = normalizedWhatsappNumber(message.from); if (!phone) return;
  const client = await findClient(phone); if (!client) return; // mensagens pessoais/desconhecidas não entram no CRM
  const data = client.data(); const text = object(message.text); const type = String(message.type || "unknown");
  const content = type === "text" ? String(text.body || "") : `[${type}]`;
  await adminFirestore().collection("whatsappMensagens").doc(String(message.id)).set({ provider: "META_CLOUD_API", direction: "INBOUND", metaMessageId: String(message.id), clienteId: client.id, clienteNome: String(data.nome || contact.profile && object(contact.profile).name || ""), socioId: String(data.socioId || ""), telefone: phone, type, content: content.slice(0, 4_000), timestamp: String(message.timestamp || ""), receivedAt: FieldValue.serverTimestamp() }, { merge: true });
}

async function persistEcho(message: Data) {
  const phone = normalizedWhatsappNumber(message.to); if (!phone) return;
  const client = await findClient(phone); if (!client) return;
  const data = client.data(); const type = String(message.type || "unknown"); const content = type === "text" ? String(object(message.text).body || "") : `[${type}]`;
  const id = String(message.id || ""); if (!id) return;
  await adminFirestore().collection("whatsappMensagens").doc(id).set({ provider: "META_CLOUD_API", direction: "OUTBOUND", source: "BUSINESS_APP_ECHO", metaMessageId: id, clienteId: client.id, clienteNome: String(data.nome || ""), socioId: String(data.socioId || ""), telefone: phone, type, content: content.slice(0, 4_000), timestamp: String(message.timestamp || ""), receivedAt: FieldValue.serverTimestamp() }, { merge: true });
}

async function persistStatus(statusData: Data) {
  const id = String(statusData.id || ""); const status = String(statusData.status || "") as MetaDeliveryStatus;
  if (!id || !["sent", "delivered", "read", "failed"].includes(status)) return;
  const db = adminFirestore(); const charges = await db.collection("cobrancas").where("metaMessageId", "==", id).limit(1).get();
  if (charges.empty) return;
  const charge = charges.docs[0]; const crmStatus = crmStatusFromMeta(status); const errors = array(statusData.errors);
  const batch = db.batch(); batch.update(charge.ref, { status: crmStatus, metaStatus: status.toUpperCase(), metaAtualizadoEm: FieldValue.serverTimestamp(), ...(errors.length ? { metaErrorCode: String(errors[0].code || ""), metaErrorTitle: String(errors[0].title || "") } : {}) });
  const logs = await db.collection("cobrancaLogs").where("cobrancaId", "==", charge.id).get(); logs.docs.forEach(log => batch.update(log.ref, { resultado: crmStatus, metaStatus: status.toUpperCase(), metaAtualizadoEm: FieldValue.serverTimestamp() })); await batch.commit();
}

export async function POST(request: NextRequest) {
  const raw = Buffer.from(await request.arrayBuffer());
  if (!validMetaSignature(raw, request.headers.get("x-hub-signature-256"))) return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  let body: Data; try { body = JSON.parse(raw.toString("utf8")) as Data; } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }
  if (body.object !== "whatsapp_business_account") return NextResponse.json({ accepted: true, ignored: true });
  for (const entry of array(body.entry)) for (const change of array(entry.changes)) {
    const value = object(change.value); const contacts = array(value.contacts);
    for (const message of array(value.messages)) await persistInbound(message, contacts[0] || {});
    for (const echo of [...array(value.smb_message_echoes), ...array(value.message_echoes)]) await persistEcho(echo);
    for (const status of array(value.statuses)) await persistStatus(status);
  }
  return NextResponse.json({ accepted: true });
}
