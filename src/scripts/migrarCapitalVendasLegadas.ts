import { collection, doc, getDocs, updateDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { calcularFinanceiroPago } from "@/services/calculosFinanceiros";

/**
 * Corrige somente vendas/repasses cujo capital foi salvo como zero e que
 * possuem custo de aquisição. É idempotente: registros já consistentes não
 * são modificados. Execute uma única vez pela console administrativa.
 */
export async function migrarCapitalVendasLegadas() {
  const [vendasSnapshot, repassesSnapshot, parcelasSnapshot, produtosSnapshot] = await Promise.all([
    getDocs(collection(db, "vendas")),
    getDocs(collection(db, "repasses")),
    getDocs(collection(db, "parcelas")),
    getDocs(collection(db, "estoque")),
  ]);

  const custoPorProduto = new Map(
    produtosSnapshot.docs.map((item) => [item.id, Number(item.data().custo || 0)])
  );

  const repassePorVenda = new Map(
    repassesSnapshot.docs.map((item) => [item.data().idVenda, { id: item.id, ...item.data() }])
  );
  const parcelasPagasPorVenda = new Map<string, number>();
  parcelasSnapshot.docs.forEach((item) => {
    const parcela = item.data();
    if (parcela.status === "PAGA" && parcela.vendaId) {
      parcelasPagasPorVenda.set(parcela.vendaId, (parcelasPagasPorVenda.get(parcela.vendaId) || 0) + 1);
    }
  });

  let vendasCorrigidas = 0;
  let repassesCorrigidos = 0;

  for (const item of vendasSnapshot.docs) {
    const venda = item.data();
    const custoProduto = Number(venda.custoProduto || custoPorProduto.get(venda.produtoId) || 0);
    const capitalInvestido = Number(venda.capitalSocio || 0);
    if (custoProduto <= 0 || capitalInvestido > 0) continue;

    await updateDoc(doc(db, "vendas", item.id), {
      capitalSocio: custoProduto,
      ...(Number(venda.custoProduto || 0) > 0 ? {} : { custoProduto }),
    });
    vendasCorrigidas++;

    const repasse = repassePorVenda.get(item.id) as any;
    if (!repasse || Number(repasse.capitalInvestido || 0) > 0) continue;

    const parcelas = Math.max(Number(repasse.parcelas || venda.parcelas || 1), 1);
    const calculo = calcularFinanceiroPago({
      tipoSocio: repasse.tipoSocio || venda.tipoSocio,
      capitalInvestido: custoProduto,
      entrada: Number(repasse.entrada ?? venda.entrada ?? 0),
      lucroTotal: Number(repasse.lucroTotal ?? Number(venda.valorProduto || 0) - custoProduto),
      parcelas,
    }, parcelasPagasPorVenda.get(item.id) || 0);

    await updateDoc(doc(db, "repasses", repasse.id), {
      capitalInvestido: custoProduto,
      capitalRecuperado: calculo.capitalRecuperado,
      capitalRestante: calculo.capitalRestante,
      capitalPorParcela: calculo.capitalPorParcela,
      socioRecebido: calculo.socioRecebido,
      empresaRecebido: calculo.empresaRecebido,
      valorReceber: Math.max(calculo.socioReceber + calculo.empresaReceber, 0),
    });
    repassesCorrigidos++;
  }

  return { vendasCorrigidas, repassesCorrigidos };
}
