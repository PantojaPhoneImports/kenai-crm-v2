export type ProviderWhatsapp = "WAME" | "EVOLUTION" | "META_CLOUD_API" | "Z_API" | "ULTRAMSG";
export type StatusCobranca = "PENDENTE" | "ENVIADA" | "IGNORADA" | "ERRO";
export interface ProviderConfiguracao {
  url: string;
  token: string;
  instancia: string;
  numero: string;
}
export interface Cobranca { id?: string; clienteId?: string; cliente: string; telefone: string; produto: string; parcela: number; valor: number; vencimento: string; tipoMensagem: string; status: StatusCobranca; criadoEm: string; enviadoEm?: string; provider: ProviderWhatsapp; tentativas: number; responsavel?: string; mensagem: string; evolutionMessageId?: string; evolutionStatus?: string; metaMessageId?: string; metaStatus?: string; }
export interface ConfiguracaoCobranca {
  id?: string;
  providerAtivo: ProviderWhatsapp;
  horario: string;
  empresa: string;
  telefone: string;
  mensagemPadrao: string;
  assinatura: string;
  diasAntecedencia: number[];
  providers?: Partial<Record<ProviderWhatsapp, ProviderConfiguracao>>;
}
