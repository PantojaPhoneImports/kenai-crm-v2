export interface Parcela {
  id?: string;
  vendaId: string;
  clienteId: string;
  clienteNome: string;
  produtoId: string;
  produtoNome: string;
  socioId: string;
  socioNome: string;
  parcela: number;
  totalParcelas: number;
  valor: number;
  vencimento: Date;
  status: "PENDENTE" | "PAGA";
  createdAt?: unknown;
  updatedAt?: unknown;
  dataPagamento?: unknown;
  formaPagamento?: string;
  observacao?: string;
  ultimaCobranca?: string;
  dataUltimaCobranca?: string;
  tipoMensagem?: string;
  statusEnvio?: string;
}
