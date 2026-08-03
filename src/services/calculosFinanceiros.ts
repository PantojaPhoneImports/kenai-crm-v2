export type TipoSocioFinanceiro = "INVESTIDOR" | "PARCEIRO";

export interface BaseFinanceiraSocio {
  tipoSocio?: string;
  capitalInvestido: number;
  entrada?: number;
  valorVenda?: number;
  lucroTotal?: number;
  custoProduto?: number;
  parcelas: number;
}

/** Fonte única de verdade para capital e lucro de uma venda de sócio. */
export function calcularFinanceiroSocio(base: BaseFinanceiraSocio) {
  const tipoSocio: TipoSocioFinanceiro =
    base.tipoSocio === "INVESTIDOR" ? "INVESTIDOR" : "PARCEIRO";
  // Vendas antigas de parceiro podem ter sido gravadas com capitalSocio = 0,
  // embora o custo de aquisição esteja presente. O custo é a fonte de
  // recuperação nesses casos; para vendas atuais, o capital gravado prevalece.
  const capitalInformado = Number(base.capitalInvestido || 0);
  const custoProduto = Number(base.custoProduto || 0);
  const capitalInvestido = capitalInformado > 0 ? capitalInformado : custoProduto;
  const entrada = Math.max(Number(base.entrada || 0), 0);
  const quantidadeParcelas = Math.max(Number(base.parcelas || 1), 1);
  const lucroTotal = Number.isFinite(Number(base.lucroTotal))
    ? Number(base.lucroTotal)
    : Number(base.valorVenda || 0) - (custoProduto || capitalInvestido);
  const capitalRecuperadoEntrada = Math.min(entrada, capitalInvestido);
  const capitalRestante = Math.max(capitalInvestido - capitalRecuperadoEntrada, 0);
  const lucroSocioTotal = tipoSocio === "INVESTIDOR" ? lucroTotal : lucroTotal / 2;
  const lucroEmpresaTotal = tipoSocio === "INVESTIDOR" ? 0 : lucroTotal / 2;
  const capitalPorParcela = capitalRestante / quantidadeParcelas;
  const lucroSocioPorParcela = lucroSocioTotal / quantidadeParcelas;
  const lucroEmpresaPorParcela = lucroEmpresaTotal / quantidadeParcelas;

  return {
    tipoSocio,
    capitalInvestido,
    capitalRecuperadoEntrada,
    capitalRestante,
    lucroTotal,
    lucroSocioTotal,
    lucroEmpresaTotal,
    capitalPorParcela,
    lucroSocioPorParcela,
    lucroEmpresaPorParcela,
    socioPorParcela: capitalPorParcela + lucroSocioPorParcela,
    empresaPorParcela: lucroEmpresaPorParcela,
  };
}

export function calcularFinanceiroPago(
  base: BaseFinanceiraSocio,
  parcelasPagas: number
) {
  const calculo = calcularFinanceiroSocio(base);
  const pagas = Math.min(Math.max(parcelasPagas, 0), Math.max(Number(base.parcelas || 1), 1));
  const capitalRecuperado = calculo.capitalRecuperadoEntrada + calculo.capitalPorParcela * pagas;
  const lucroRecebido = calculo.lucroSocioPorParcela * pagas;

  return {
    ...calculo,
    capitalRecuperado,
    capitalRestante: Math.max(calculo.capitalInvestido - capitalRecuperado, 0),
    lucroRecebido,
    lucroReceber: Math.max(calculo.lucroSocioTotal - lucroRecebido, 0),
    socioRecebido: calculo.capitalRecuperadoEntrada + calculo.socioPorParcela * pagas,
    socioReceber: calculo.capitalRestante + calculo.lucroSocioTotal - calculo.socioPorParcela * pagas,
    empresaRecebido: calculo.empresaPorParcela * pagas,
    empresaReceber: calculo.lucroEmpresaTotal - calculo.empresaPorParcela * pagas,
  };
}
