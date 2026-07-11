export interface Produto {

  id?: string;

  nome: string;

  imei: string;

  marca: string;

  modelo: string;

  cor: string;

  capacidade: string;

  fornecedor: string;

  custo: number;

  venda: number;

  status:
    | "DISPONIVEL"
    | "VENDIDO"
    | "RESERVADO"
    | "MANUTENCAO";

  socioId: string;

  socioNome: string;

}