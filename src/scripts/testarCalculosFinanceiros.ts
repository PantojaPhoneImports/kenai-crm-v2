import { calcularFinanceiroPago, calcularFinanceiroSocio } from "../services/calculosFinanceiros";

function aproximar(atual: number, esperado: number, nome: string) {
  if (Math.abs(atual - esperado) > 0.01) {
    throw new Error(`${nome}: esperado ${esperado}, recebido ${atual}`);
  }
}

const parceiro = calcularFinanceiroSocio({
  tipoSocio: "PARCEIRO",
  capitalInvestido: 2080,
  entrada: 500,
  valorVenda: 5000,
  custoProduto: 2080,
  parcelas: 12,
});

aproximar(parceiro.capitalRestante, 1580, "capital restante do parceiro");
aproximar(parceiro.lucroSocioTotal, 1460, "lucro do parceiro");
aproximar(parceiro.lucroEmpresaTotal, 1460, "lucro da empresa");
aproximar(parceiro.socioPorParcela, 253.333333, "repasse do parceiro por parcela");
aproximar(parceiro.empresaPorParcela, 121.666667, "repasse da empresa por parcela");

const parceiroComUmaParcelaPaga = calcularFinanceiroPago({
  tipoSocio: "PARCEIRO",
  capitalInvestido: 0,
  entrada: 500,
  valorVenda: 5000,
  custoProduto: 2080,
  parcelas: 12,
}, 1);

aproximar(parceiroComUmaParcelaPaga.capitalInvestido, 2080, "fallback de custo para capital");
aproximar(parceiroComUmaParcelaPaga.capitalRecuperado, 631.666667, "capital recuperado após uma parcela");
aproximar(parceiroComUmaParcelaPaga.capitalRestante, 1448.333333, "capital restante após uma parcela");
aproximar(parceiroComUmaParcelaPaga.lucroRecebido, 121.666667, "seu lucro após uma parcela");
aproximar(parceiroComUmaParcelaPaga.empresaRecebido, 121.666667, "lucro Pantoja após uma parcela");

const investidor = calcularFinanceiroSocio({
  tipoSocio: "INVESTIDOR",
  capitalInvestido: 4000,
  valorVenda: 5000,
  custoProduto: 4000,
  parcelas: 12,
});

aproximar(investidor.lucroSocioTotal, 1000, "lucro do investidor");
aproximar(investidor.lucroEmpresaTotal, 0, "lucro da empresa para investidor");

console.log("Cenários financeiros validados com sucesso.");
