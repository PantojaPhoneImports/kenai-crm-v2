import { listarProdutos } from "./estoque";
import { listarVendas } from "./vendas";
import { listarParcelas } from "./parcelas";
import type { Venda } from "@/types/venda";
export async function calcularResumoSocio(socioId: string) {

  const produtos = await listarProdutos();
  const vendas = await listarVendas();
  const parcelas = await listarParcelas();

  const produtosSocio = produtos.filter(
    (produto: any) => produto.socioId === socioId
  );

  const vendasSocio: Venda[] = vendas.filter(
  (venda: any) => venda.socioId === socioId
) as Venda[];

  const parcelasSocio = parcelas.filter(
    (parcela: any) => parcela.socioId === socioId
  );

  const clientes = new Set(
    vendasSocio.map(
      (venda: any) => venda.clienteId
    )
  );

  let capitalInvestido = 0;
  let capitalRecuperado = 0;

  let lucroRecebido = 0;
  let lucroReceber = 0;

  let recebido = 0;
  let receber = 0;

  produtosSocio.forEach((produto: any) => {

    capitalInvestido +=
      Number(produto.capitalSocio || 0);

  });

  parcelasSocio.forEach((parcela: any) => {

    const venda: Venda | undefined = vendasSocio.find(
  (v) => v.id === parcela.vendaId
);

    if (!venda) return;

    const totalParcelas =
      Number(venda.parcelas || 1);

    const capitalParcela =
      Number(venda.capitalSocio || 0) /
      totalParcelas;

    const lucroTotalVenda =
      Number(venda.valorProduto || 0)
      -
      Number(venda.custoProduto || 0);

    const percentualLucro =
      Number(venda.percentualLucro || 100);

    const lucroSocioVenda =
      lucroTotalVenda *
      percentualLucro /
      100;

    const lucroParcela =
      lucroSocioVenda /
      totalParcelas;

    if (parcela.status === "PAGA") {

      capitalRecuperado +=
        capitalParcela;

      lucroRecebido +=
        lucroParcela;

      recebido +=
        Number(parcela.valor || 0);

    } else {

      lucroReceber +=
        lucroParcela;

      receber +=
        Number(parcela.valor || 0);

    }

  });

  return {

    estoque:
      produtosSocio.length,

    vendas:
      vendasSocio.length,

    clientes:
      clientes.size,

    capitalInvestido,

    capitalRecuperado,

    capitalRestante:
      capitalInvestido -
      capitalRecuperado,

    lucroRecebido,

    lucroReceber,

    lucroTotal:
      lucroRecebido +
      lucroReceber,

    recebido,

    receber,

  };

}