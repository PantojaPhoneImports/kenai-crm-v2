import { createHmac, timingSafeEqual } from "crypto";

export type MetaDeliveryStatus = "sent" | "delivered" | "read" | "failed";

export function metaConfig() {
  return {
    accessToken: process.env.META_WHATSAPP_ACCESS_TOKEN || "",
    phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID || "",
    verifyToken: process.env.META_WHATSAPP_VERIFY_TOKEN || "",
    appSecret: process.env.META_APP_SECRET || "",
    wabaId: process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID || "",
    graphVersion: process.env.META_GRAPH_API_VERSION || "v25.0",
    enabled: process.env.META_CLOUD_API_ENABLED === "true",
  };
}

export function metaReadiness() {
  const config = metaConfig();
  const sendingMissing = [
    !config.accessToken && "META_WHATSAPP_ACCESS_TOKEN",
    !config.phoneNumberId && "META_WHATSAPP_PHONE_NUMBER_ID",
  ].filter(Boolean) as string[];
  const webhookMissing = [
    !config.verifyToken && "META_WHATSAPP_VERIFY_TOKEN",
    !config.appSecret && "META_APP_SECRET",
  ].filter(Boolean) as string[];
  const activationMissing = [!config.enabled && "META_CLOUD_API_ENABLED"].filter(Boolean) as string[];
  const missing = [...sendingMissing, ...webhookMissing, ...activationMissing];

  return {
    enabled: config.enabled,
    sendingConfigured: sendingMissing.length === 0,
    webhookConfigured: webhookMissing.length === 0,
    configured: sendingMissing.length === 0 && webhookMissing.length === 0,
    ready: missing.length === 0,
    sendingMissing,
    webhookMissing,
    activationMissing,
    missing,
  };
}

export function validMetaSignature(rawBody: Buffer, signatureHeader: string | null) {
  const secret = metaConfig().appSecret;
  if (!secret || !signatureHeader?.startsWith("sha256=")) return false;
  const expected = Buffer.from(`sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`);
  const received = Buffer.from(signatureHeader);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function validVerifyToken(received: string) {
  const expected = metaConfig().verifyToken;
  const a = Buffer.from(expected); const b = Buffer.from(received);
  return Boolean(expected && a.length === b.length && timingSafeEqual(a, b));
}

export function crmStatusFromMeta(status: MetaDeliveryStatus) {
  if (status === "failed") return "ERRO" as const;
  if (status === "delivered" || status === "read") return "ENVIADA" as const;
  return "PENDENTE" as const;
}

export function normalizedWhatsappNumber(value: unknown) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.startsWith("55") ? digits.slice(2) : digits;
}

export function metaRecipientNumber(value: unknown) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}
