export interface Venda {

  id?: string;

  clienteId?: string;

  clienteNome: string;

  produtoId?: string;

  produtoNome: string;

  imei: string;

  valorProduto: number;

  entrada: number;

  saldo: number;

  parcelas: number;

  valorParcela: number;

  formaPagamento: string;

  status:
    | "ABERTA"
    | "FINALIZADA"
    | "CANCELADA";
}