export interface Produto {
  id?: string;

  marca: string;

  modelo: string;

  capacidade: string;

  cor: string;

  imei: string;

  bateria: number;

  fornecedor: string;

  custo: number;

  venda: number;

  garantia: string;

  status:
    | "ESTOQUE"
    | "RESERVADO"
    | "VENDIDO";

  createdAt?: Date;
}