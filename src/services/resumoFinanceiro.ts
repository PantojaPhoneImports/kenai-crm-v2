import { listarClientes } from "./clientes";
import { listarProdutos } from "./estoque";
import { listarParcelas } from "./parcelas";
import { listarVendas } from "./vendas";
import { possuiSocioId } from "@/lib/socio";
import type { Venda } from "@/types/venda";
import { calcularFinanceiroPago } from "./calculosFinanceiros";

export function calcularResumoFinanceiro(vendas: Venda[], parcelas: any[]) {
  return vendas.reduce((resumo, venda) => {
    const parcelasVenda = parcelas.filter((parcela) => parcela.vendaId === venda.id);
    const calculo = calcularFinanceiroPago({ tipoSocio: venda.tipoSocio, capitalInvestido: Number(venda.capitalSocio || 0), entrada: Number(venda.entrada || 0), valorVenda: Number(venda.valorProduto || 0), custoProduto: Number(venda.custoProduto || 0), parcelas: Number(venda.parcelas || 1) }, parcelasVenda.filter((parcela) => parcela.status === "PAGA").length);
    resumo.capitalInvestido += calculo.capitalInvestido;
    resumo.capitalRecuperado += calculo.capitalRecuperado;
    resumo.capitalRestante += calculo.capitalRestante;
    resumo.lucroRecebido += calculo.lucroRecebido;
    resumo.lucroReceber += calculo.lucroReceber;
    resumo.lucroEmpresaRecebido += calculo.empresaRecebido;
    resumo.lucroEmpresaReceber += calculo.empresaReceber;
    return resumo;
  }, { capitalInvestido: 0, capitalRecuperado: 0, capitalRestante: 0, lucroRecebido: 0, lucroReceber: 0, lucroEmpresaRecebido: 0, lucroEmpresaReceber: 0 });
}

export async function calcularResumoSocio(socioId: string) {
  if (!possuiSocioId(socioId)) throw new Error("socioId é obrigatório para calcular o resumo financeiro.");
  const [clientes, produtos, vendas, parcelas] = await Promise.all([listarClientes(socioId), listarProdutos(socioId), listarVendas(socioId), listarParcelas(socioId)]);
  const vendasSocio = vendas as Venda[];
  const financeiro = calcularResumoFinanceiro(vendasSocio, parcelas);
  return {
    estoque: produtos.length,
    vendas: vendasSocio.length,
    clientes: clientes.length,
    ...financeiro,
    tipoSocio: vendasSocio[0]?.tipoSocio,
    lucroTotal: financeiro.lucroRecebido + financeiro.lucroReceber,
    recebido: financeiro.capitalRecuperado + financeiro.lucroRecebido,
    receber: financeiro.capitalRestante + financeiro.lucroReceber,
  };
}
