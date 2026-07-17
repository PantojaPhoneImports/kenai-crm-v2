export interface Venda {

  id?: string;

  clienteId?: string;

  clienteNome: string;

  produtoId?: string;

  produtoNome: string;

  imei: string;

  socioId: string;

  socioNome: string;

  tipoSocio: "PARCEIRO" | "INVESTIDOR";

  valorProduto: number;

  custoProduto: number;

  capitalSocio: number;

  capitalEmpresa: number;

  percentualSocio: number;

  percentualEmpresa: number;

  entrada: number;

  entradaDestino: "SOCIO" | "EMPRESA";

  saldo: number;

  parcelas: number;

  valorParcela: number;

  formaPagamento: string;

  status:
    | "ABERTA"
    | "FINALIZADA"
    | "CANCELADA";

}