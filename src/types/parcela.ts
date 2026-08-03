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
  createdAt?: Date;
  dataPagamento?: string;
  formaPagamento?: string;
  observacao?: string;
}
