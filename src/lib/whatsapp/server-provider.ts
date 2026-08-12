import type { ProviderWhatsapp } from "@/types/cobranca";
import { metaReadiness } from "./meta-cloud";

export type ServerSendInput = { telefone: string; clienteId: string; templateName: string; languageCode?: string; parameters: string[] };
export type ServerSendResult = { provider: ProviderWhatsapp; messageId: string; status: "PENDENTE" };
export interface ServerWhatsappProvider { id: ProviderWhatsapp; ready(): boolean; sendTemplate(input: ServerSendInput): Promise<ServerSendResult>; }

class DisabledMetaCloudProvider implements ServerWhatsappProvider {
  id: ProviderWhatsapp = "META_CLOUD_API";
  ready() { return metaReadiness().enabled && metaReadiness().configured; }
  async sendTemplate(_input: ServerSendInput): Promise<ServerSendResult> { throw new Error("META_CLOUD_API_DISABLED"); }
}

export const serverWhatsappProviders = { META_CLOUD_API: new DisabledMetaCloudProvider() } as const;
