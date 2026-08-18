"use client";

import type { ProviderWhatsapp } from "@/types/cobranca";
import { auth } from "@/lib/firebase";

async function headersAutenticados() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Sessão expirada. Entre novamente no CRM.");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface WhatsappProvider {
  id: ProviderWhatsapp;
  send(input: { telefone: string; mensagem: string; cliente?: string; clienteId?: string; templateName?: string; parameters?: string[] }): Promise<{ status: "ENVIADA" | "PENDENTE" | "ERRO"; provider: ProviderWhatsapp; response?: unknown }>;
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
    const resposta = await fetch("/api/whatsapp/evolution", { method: "POST", headers: await headersAutenticados(), body: JSON.stringify({ action: "send", telefone, mensagem, cliente, clienteId }) });
    const dados = await resposta.json(); if (!resposta.ok) { const mensagemEvolution = dados.evolution?.response?.message ?? dados.evolution?.message ?? dados.error ?? dados; throw new Error(typeof mensagemEvolution === "string" ? mensagemEvolution : JSON.stringify(mensagemEvolution)); }
    const status = dados.status === "ENVIADA" || dados.status === "ERRO" ? dados.status : "PENDENTE";
    return { status: status as "ENVIADA" | "PENDENTE" | "ERRO", provider: this.id, response: dados };
  }
  async validate() { const resposta = await fetch("/api/whatsapp/evolution", { method: "POST", headers: await headersAutenticados(), body: JSON.stringify({ action: "status" }) }); return resposta.ok; }
  async testConnection() { const resposta = await fetch("/api/whatsapp/evolution", { method: "POST", headers: await headersAutenticados(), body: JSON.stringify({ action: "test" }) }); const dados = await resposta.json(); return { ok: resposta.ok, message: resposta.ok ? `Evolution: ${dados.status}.` : (dados.error || "Evolution indisponível.") }; }
  status() { return "ATIVO" as const; }
}
class MetaCloudProvider implements WhatsappProvider {
  id: ProviderWhatsapp = "META_CLOUD_API";
  async send({ clienteId, templateName, parameters = [] }: { telefone: string; mensagem: string; clienteId?: string; templateName?: string; parameters?: string[] }) {
    if (!clienteId || !templateName) throw new Error("Cliente ou template Meta não informado.");
    const resposta = await fetch("/api/whatsapp/meta", { method: "POST", headers: await headersAutenticados(), body: JSON.stringify({ action: "send-template", clienteId, templateName, parameters, languageCode: "pt_BR" }) });
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.error || "Falha no envio pela Meta Cloud API.");
    return { status: "PENDENTE" as const, provider: this.id, response: { meta: dados } };
  }
  async validate() { const resposta = await fetch("/api/whatsapp/meta", { headers: await headersAutenticados(), cache: "no-store" }); const dados = await resposta.json(); return resposta.ok && dados.ready === true; }
  async testConnection() { const ok = await this.validate(); return { ok, message: ok ? "Meta Cloud API pronta." : "Meta Cloud API incompleta." }; }
  status() { return "ATIVO" as const; }
}
class PlaceholderProvider implements WhatsappProvider {
  constructor(public id: ProviderWhatsapp) {}
  async send(_input: { telefone: string; mensagem: string }): Promise<{ status: "ENVIADA" | "PENDENTE" | "ERRO"; provider: ProviderWhatsapp }> { throw new Error(`${this.id} ainda não está configurado.`); }
  async validate() { return false; }
  async testConnection() { return { ok: false, message: `${this.id} ainda não configurado.` }; }
  status() { return "CONFIGURAR" as const; }
}
const providers: Record<ProviderWhatsapp, WhatsappProvider> = { WAME: new WaMeProvider(), EVOLUTION: new EvolutionProvider(), META_CLOUD_API: new MetaCloudProvider(), Z_API: new PlaceholderProvider("Z_API"), ULTRAMSG: new PlaceholderProvider("ULTRAMSG") };
export const whatsappProvider = { get: (id: ProviderWhatsapp = "WAME") => providers[id], send: (input: { telefone: string; mensagem: string; cliente?: string; clienteId?: string; provider?: ProviderWhatsapp; templateName?: string; parameters?: string[] }) => providers[input.provider || "WAME"].send(input) };
