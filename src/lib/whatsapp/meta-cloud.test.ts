import { createHmac } from "crypto";
import assert from "node:assert/strict";
import test from "node:test";
import { crmStatusFromMeta, metaReadiness, normalizedWhatsappNumber, validMetaSignature, validVerifyToken } from "./meta-cloud";

function withMetaEnv(values: Record<string, string | undefined>, run: () => void) {
  const original = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]));
  try { for (const [key, value] of Object.entries(values)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } run(); }
  finally { for (const [key, value] of Object.entries(original)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } }
}

test("valida assinatura HMAC SHA-256 da Meta", () => {
  process.env.META_APP_SECRET = "segredo-de-teste"; const body = Buffer.from('{"object":"whatsapp_business_account"}');
  const signature = `sha256=${createHmac("sha256", process.env.META_APP_SECRET).update(body).digest("hex")}`;
  assert.equal(validMetaSignature(body, signature), true); assert.equal(validMetaSignature(Buffer.from("alterado"), signature), false);
});
test("valida verify token sem comparação vulnerável", () => { process.env.META_WHATSAPP_VERIFY_TOKEN = "token-teste"; assert.equal(validVerifyToken("token-teste"), true); assert.equal(validVerifyToken("incorreto"), false); });
test("HTTP 200 não equivale a entrega", () => { assert.equal(crmStatusFromMeta("sent"), "PENDENTE"); assert.equal(crmStatusFromMeta("delivered"), "ENVIADA"); assert.equal(crmStatusFromMeta("read"), "ENVIADA"); assert.equal(crmStatusFromMeta("failed"), "ERRO"); });
test("normaliza telefone brasileiro", () => { assert.equal(normalizedWhatsappNumber("+55 (91) 98826-1188"), "91988261188"); });
test("separa prontidão de envio, webhook e ativação", () => withMetaEnv({ META_WHATSAPP_ACCESS_TOKEN: "access", META_WHATSAPP_PHONE_NUMBER_ID: "phone", META_APP_SECRET: "secret", META_WHATSAPP_VERIFY_TOKEN: undefined, META_CLOUD_API_ENABLED: undefined }, () => {
  const state = metaReadiness();
  assert.equal(state.sendingConfigured, true); assert.equal(state.webhookConfigured, false); assert.equal(state.ready, false);
  assert.deepEqual(state.missing, ["META_WHATSAPP_VERIFY_TOKEN", "META_CLOUD_API_ENABLED"]);
}));
test("fica pronta somente com webhook e flag explícita", () => withMetaEnv({ META_WHATSAPP_ACCESS_TOKEN: "access", META_WHATSAPP_PHONE_NUMBER_ID: "phone", META_APP_SECRET: "secret", META_WHATSAPP_VERIFY_TOKEN: "verify", META_CLOUD_API_ENABLED: "true" }, () => {
  assert.equal(metaReadiness().ready, true);
}));
