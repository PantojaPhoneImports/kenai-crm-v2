import { createHmac } from "crypto";
import assert from "node:assert/strict";
import test from "node:test";
import { crmStatusFromMeta, normalizedWhatsappNumber, validMetaSignature, validVerifyToken } from "./meta-cloud";

test("valida assinatura HMAC SHA-256 da Meta", () => {
  process.env.META_APP_SECRET = "segredo-de-teste"; const body = Buffer.from('{"object":"whatsapp_business_account"}');
  const signature = `sha256=${createHmac("sha256", process.env.META_APP_SECRET).update(body).digest("hex")}`;
  assert.equal(validMetaSignature(body, signature), true); assert.equal(validMetaSignature(Buffer.from("alterado"), signature), false);
});
test("valida verify token sem comparação vulnerável", () => { process.env.META_WHATSAPP_VERIFY_TOKEN = "token-teste"; assert.equal(validVerifyToken("token-teste"), true); assert.equal(validVerifyToken("incorreto"), false); });
test("HTTP 200 não equivale a entrega", () => { assert.equal(crmStatusFromMeta("sent"), "PENDENTE"); assert.equal(crmStatusFromMeta("delivered"), "ENVIADA"); assert.equal(crmStatusFromMeta("read"), "ENVIADA"); assert.equal(crmStatusFromMeta("failed"), "ERRO"); });
test("normaliza telefone brasileiro", () => { assert.equal(normalizedWhatsappNumber("+55 (91) 98826-1188"), "91988261188"); });
