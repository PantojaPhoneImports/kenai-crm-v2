export type ProviderWhatsapp = "WAME" | "EVOLUTION" | "META_CLOUD" | "Z_API" | "ULTRAMSG";
export type StatusCobranca = "PENDENTE" | "ENVIADA" | "IGNORADA" | "ERRO";
export interface Cobranca { id?: string; clienteId?: string; cliente: string; telefone: string; produto: string; parcela: number; valor: number; vencimento: string; tipoMensagem: string; status: StatusCobranca; criadoEm: string; enviadoEm?: string; provider: ProviderWhatsapp; tentativas: number; responsavel?: string; mensagem: string; }
export interface ConfiguracaoCobranca { id?: string; providerAtivo: ProviderWhatsapp; horario: string; empresa: string; telefone: string; mensagemPadrao: string; assinatura: string; diasAntecedencia: number[]; }
