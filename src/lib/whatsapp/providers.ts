"use client";
import type { ProviderWhatsapp } from "@/types/cobranca";
export interface WhatsappProvider { id: ProviderWhatsapp; send(input: { telefone: string; mensagem: string }): Promise<{ status: "ENVIADA" | "PENDENTE"; provider: ProviderWhatsapp }>; }
class WaMeProvider implements WhatsappProvider { id: ProviderWhatsapp = "WAME"; async send({ telefone, mensagem }: { telefone: string; mensagem: string }) { window.open(`https://wa.me/55${telefone.replace(/\D/g, "")}?text=${encodeURIComponent(mensagem)}`, "_blank"); return { status: "PENDENTE" as const, provider: this.id }; } }
class PlaceholderProvider implements WhatsappProvider { constructor(public id: ProviderWhatsapp) {} async send(_input: { telefone: string; mensagem: string }): Promise<{ status: "ENVIADA" | "PENDENTE"; provider: ProviderWhatsapp }> { throw new Error(`${this.id} ainda não está configurado.`); } }
const providers: Record<ProviderWhatsapp, WhatsappProvider> = { WAME: new WaMeProvider(), EVOLUTION: new PlaceholderProvider("EVOLUTION"), META_CLOUD: new PlaceholderProvider("META_CLOUD"), Z_API: new PlaceholderProvider("Z_API"), ULTRAMSG: new PlaceholderProvider("ULTRAMSG") };
export const whatsappProvider = { get: (id: ProviderWhatsapp = "WAME") => providers[id], send: (input: { telefone: string; mensagem: string; provider?: ProviderWhatsapp }) => providers[input.provider || "WAME"].send(input) };
