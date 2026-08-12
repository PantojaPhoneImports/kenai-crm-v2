import { createHmac, timingSafeEqual } from "crypto";

export type MetaDeliveryStatus = "sent" | "delivered" | "read" | "failed";

export function metaConfig() {
  return {
    accessToken: process.env.META_WHATSAPP_ACCESS_TOKEN || "",
    phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID || "",
    verifyToken: process.env.META_WHATSAPP_VERIFY_TOKEN || "",
    appSecret: process.env.META_APP_SECRET || "",
    enabled: process.env.META_CLOUD_API_ENABLED === "true",
  };
}

export function metaReadiness() {
  const config = metaConfig();
  return { enabled: config.enabled, configured: Boolean(config.accessToken && config.phoneNumberId && config.verifyToken && config.appSecret), missing: [!config.accessToken && "META_WHATSAPP_ACCESS_TOKEN", !config.phoneNumberId && "META_WHATSAPP_PHONE_NUMBER_ID", !config.verifyToken && "META_WHATSAPP_VERIFY_TOKEN", !config.appSecret && "META_APP_SECRET"].filter(Boolean) as string[] };
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
