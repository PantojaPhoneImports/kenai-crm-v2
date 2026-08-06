"use client";

import type { ProviderWhatsapp } from "@/types/cobranca";

export interface WhatsappProvider {
  id: ProviderWhatsapp;
  send(input: { telefone: string; mensagem: string; cliente?: string; clienteId?: string }): Promise<{ status: "ENVIADA" | "PENDENTE"; provider: ProviderWhatsapp; response?: unknown }>;
  validate(): Promise<boolean>;
  testConnection(): Promise<{ ok: boolean; message: string }>;
  status(): "ATIVO" | "CONFIGURAR";
}
class WaMeProvider implements WhatsappProvider {
  id: ProviderWhatsapp = "WAME";
  async send({ telefone, mensagem }: { telefone: string; mensagem: string }) { const url = `https://wa.me/55${telefone.replace(/\D/g, "")}?text=${encodeURIComponent(mensagem)}`; window.open(url, "_blank"); return { status: "PENDENTE" as const, provider: this.id, response: { action: "window.open", url } }; }
  async validate() { return true; }
  async testConnection() { return { ok: true, message: "Wa.me disponível no navegador." }; }
  status() { return "ATIVO" as const; }
}
class EvolutionProvider implements WhatsappProvider {
  id: ProviderWhatsapp = "EVOLUTION";
  async send({ telefone, mensagem, cliente, clienteId }: { telefone: string; mensagem: string; cliente?: string; clienteId?: string }) {
    const resposta = await fetch("/api/whatsapp/evolution", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "send", telefone, mensagem, cliente, clienteId }) });
    const dados = await resposta.json(); if (!resposta.ok) throw new Error(dados.error || "Falha ao enviar pela Evolution.");
    return { status: dados.status === "ENVIADA" ? "ENVIADA" as const : "PENDENTE" as const, provider: this.id, response: dados };
  }
  async validate() { const resposta = await fetch("/api/whatsapp/evolution", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "status" }) }); return resposta.ok; }
  async testConnection() { const resposta = await fetch("/api/whatsapp/evolution", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "test" }) }); const dados = await resposta.json(); return { ok: resposta.ok, message: resposta.ok ? `Evolution: ${dados.status}.` : (dados.error || "Evolution indisponível.") }; }
  status() { return "ATIVO" as const; }
}
class PlaceholderProvider implements WhatsappProvider {
  constructor(public id: ProviderWhatsapp) {}
  async send(_input: { telefone: string; mensagem: string }): Promise<{ status: "ENVIADA" | "PENDENTE"; provider: ProviderWhatsapp }> { throw new Error(`${this.id} ainda não está configurado.`); }
  async validate() { return false; }
  async testConnection() { return { ok: false, message: `${this.id} ainda não configurado.` }; }
  status() { return "CONFIGURAR" as const; }
}
const providers: Record<ProviderWhatsapp, WhatsappProvider> = { WAME: new WaMeProvider(), EVOLUTION: new EvolutionProvider(), META_CLOUD: new PlaceholderProvider("META_CLOUD"), Z_API: new PlaceholderProvider("Z_API"), ULTRAMSG: new PlaceholderProvider("ULTRAMSG") };
export const whatsappProvider = { get: (id: ProviderWhatsapp = "WAME") => providers[id], send: (input: { telefone: string; mensagem: string; cliente?: string; clienteId?: string; provider?: ProviderWhatsapp }) => providers[input.provider || "WAME"].send(input) };
