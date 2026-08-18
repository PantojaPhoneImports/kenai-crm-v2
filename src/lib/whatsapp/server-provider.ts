import type { ProviderWhatsapp } from "@/types/cobranca";
import { metaConfig, metaReadiness, metaRecipientNumber } from "./meta-cloud";

export type ServerSendInput = { telefone: string; clienteId: string; templateName: string; languageCode?: string; parameters: string[] };
export type ServerSendResult = { provider: ProviderWhatsapp; messageId: string; status: "PENDENTE" };
export interface ServerWhatsappProvider { id: ProviderWhatsapp; ready(): boolean; sendTemplate(input: ServerSendInput): Promise<ServerSendResult>; }

class MetaCloudProvider implements ServerWhatsappProvider {
  id: ProviderWhatsapp = "META_CLOUD_API";
  ready() { return metaReadiness().ready; }
  async sendTemplate(input: ServerSendInput): Promise<ServerSendResult> {
    const state = metaReadiness();
    if (!state.enabled) throw new Error("META_CLOUD_API_DISABLED");
    if (!state.configured) throw new Error(`META_CLOUD_API_NOT_CONFIGURED:${state.missing.join(",")}`);
    const config = metaConfig(); const to = metaRecipientNumber(input.telefone);
    if (to.length < 12) throw new Error("META_INVALID_RECIPIENT");
    const components = input.parameters.length ? [{ type: "body", parameters: input.parameters.map(text => ({ type: "text", text: String(text).slice(0, 1_024) })) }] : undefined;
    const response = await fetch(`https://graph.facebook.com/${config.graphVersion}/${encodeURIComponent(config.phoneNumberId)}/messages`, {
      method: "POST", headers: { Authorization: `Bearer ${config.accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "template", template: { name: input.templateName, language: { code: input.languageCode || "pt_BR" }, ...(components ? { components } : {}) } }),
      cache: "no-store", signal: AbortSignal.timeout(15_000),
    });
    const result = await response.json() as { messages?: Array<{ id?: string }>; error?: { message?: string; code?: number } };
    const messageId = String(result.messages?.[0]?.id || "");
    if (!response.ok || !messageId) throw new Error(`META_SEND_FAILED:${result.error?.code || response.status}:${result.error?.message || "Resposta sem message ID"}`);
    return { provider: this.id, messageId, status: "PENDENTE" };
  }
}

export const serverWhatsappProviders = { META_CLOUD_API: new MetaCloudProvider() } as const;
