import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";

/**
 * Relatório exclusivamente de leitura. Não importa nem chama APIs de escrita.
 * A remoção futura deverá aceitar somente IDs revisados e aprovados.
 */
const PADRAO_DE_TESTE = /(teste|aaaa|abab|999|novo\s+cliente|iphone\s+teste)/i;

function textoContemPadrao(...valores: unknown[]) {
  return valores.some((valor) => PADRAO_DE_TESTE.test(String(valor || "")));
}

function dataParaLog(valor: unknown) {
  const timestamp = valor as { seconds?: number; toDate?: () => Date } | undefined;
  const data = timestamp?.toDate?.() || (timestamp?.seconds ? new Date(timestamp.seconds * 1000) : valor ? new Date(valor as string | number | Date) : null);
  return data && !Number.isNaN(data.getTime()) ? data.toLocaleString("pt-BR") : "não informada";
}

export async function listarDadosTeste() {
  console.info("[listarDadosTeste] iniciando prévia somente leitura", {
    padrao: PADRAO_DE_TESTE.source,
  });

  const [clientesSnapshot, produtosSnapshot, vendasSnapshot, parcelasSnapshot, repassesSnapshot] = await Promise.all([
    getDocs(collection(db, "clientes")),
    getDocs(collection(db, "estoque")),
    getDocs(collection(db, "vendas")),
    getDocs(collection(db, "parcelas")),
    getDocs(collection(db, "repasses")),
  ]);

  const clientesTeste = clientesSnapshot.docs
    .map((item) => ({ id: item.id, ...item.data() } as Record<string, unknown>))
    .filter((cliente) => textoContemPadrao(cliente.nome));
  const produtosTeste = produtosSnapshot.docs
    .map((item) => ({ id: item.id, ...item.data() } as Record<string, unknown>))
    .filter((produto) => textoContemPadrao(produto.nome, produto.imei));

  const clienteIds = new Set(clientesTeste.map((cliente) => String(cliente.id)));
  const produtoIds = new Set(produtosTeste.map((produto) => String(produto.id)));
  const vendasTeste = vendasSnapshot.docs
    .map((item) => ({ id: item.id, ...item.data() } as Record<string, unknown>))
    .filter((venda) =>
      clienteIds.has(String(venda.clienteId)) ||
      produtoIds.has(String(venda.produtoId)) ||
      textoContemPadrao(venda.clienteNome, venda.produtoNome)
    );

  const vendaIds = new Set(vendasTeste.map((venda) => String(venda.id)));
  const parcelasTeste = parcelasSnapshot.docs.filter((item) => vendaIds.has(String(item.data().vendaId)));
  const repassesTeste = repassesSnapshot.docs.filter((item) => vendaIds.has(String(item.data().idVenda)));

  const relatorio = {
    clientes: clientesTeste.map((cliente) => ({
      id: cliente.id,
      nome: cliente.nome || "-",
      socio: cliente.socioNome || cliente.socioId || "-",
      data: dataParaLog(cliente.createdAt || cliente.data),
    })),
    produtos: produtosTeste.map((produto) => ({
      id: produto.id,
      nome: produto.nome || "-",
      imei: produto.imei || "-",
      socio: produto.socioNome || produto.socioId || "-",
    })),
    vendas: vendasTeste.map((venda) => ({
      id: venda.id,
      cliente: venda.clienteNome || venda.clienteId || "-",
      produto: venda.produtoNome || venda.produtoId || "-",
      socio: venda.socioNome || venda.socioId || "-",
    })),
    parcelas: parcelasTeste.length,
    repasses: repassesTeste.length,
  };

  console.group("[listarDadosTeste] CLIENTES prováveis de teste");
  console.table(relatorio.clientes);
  console.groupEnd();
  console.group("[listarDadosTeste] PRODUTOS prováveis de teste");
  console.table(relatorio.produtos);
  console.groupEnd();
  console.group("[listarDadosTeste] VENDAS vinculadas ou prováveis de teste");
  console.table(relatorio.vendas);
  console.groupEnd();
  console.info("[listarDadosTeste] PARCELAS vinculadas", { quantidade: relatorio.parcelas });
  console.info("[listarDadosTeste] REPASSES vinculados", { quantidade: relatorio.repasses });
  console.info("[listarDadosTeste] fim da prévia; nenhum dado foi alterado");

  return relatorio;
}

listarDadosTeste().catch((error) => {
  console.error("[listarDadosTeste] falha ao gerar prévia", error);
});
