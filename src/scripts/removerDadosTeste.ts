import {
  collection,
  doc,
  getDoc,
  getDocs,
  writeBatch,
  type DocumentReference,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

// Lista congelada e aprovada. Não há busca por nome, texto ou heurística.
const CLIENTE_IDS = [
  "2JvkiLlls68Tsb4Y8oR7", "3YcVq7oqSwoRdgXWxGgj", "6BSYDnpz0W8OtXxOrFi7",
  "HAUhFLfGyOGlwxOagX5B", "JUZ0cIGXItmeeuMSrIs1", "KASlpIOmaFfWz7Xr1MMA",
  "KcLLEdtQALhk7iR4pAhv", "P1RgokwD3NANa4SOKIIq", "P7E8QIYrDD1Yf8ijzZxN",
  "TlhnCGhitcF10wctbFTi", "UfZo8x0qDTVWADIzUHtV", "e5QVmPY8wLjAKNiCojFX",
  "fcp0prkrGHZyvInq49Rm", "lJCHmQ9247KpEDmH4kz2", "mccbMgQKJsYQVX2R1FVK",
  "oeHKcSOvHMdRtjoeQ5H4", "rOpdvgmAOtmjBGtD5qPZ", "sSRlK9T1BKQxp7tu383N",
  "sgTdk0DuNVVo1rkPpReN", "zhZRWjby69s62FxvNSmv", "zp5PfxIvpzP2a9Xtabk9",
] as const;

const PRODUTO_IDS = [
  "HzSRazESJmSXweGiVh4X", "OAToQwfkU0TidhoemWSp", "PCdCUrQXs50oarp7GU27",
  "UR5agn8SUMphvHrC0rN9", "YiZ3L3DULK45j31sgx87", "aDfvUep9JcRn0QHpI1HL",
  "gtuqxyTDTcLEMdzu0jx3", "h0P9PGp0PrXZYll03X82", "jJv664cQTjLU4genZeeR",
  "lf1t1pGZPdrjDR3nwhUV", "lxyZPSMcdOTSuGSohVRj", "vWzvDFRoMinFdZqXknoe",
  "wdrbFK3tUualhOBsqLZD",
] as const;

const VENDA_IDS = [
  "1RWHfOz526NyeGK7EIXI", "7mULS98I1xEn5T2ODAwZ", "9IHAuVz6ZXtLYlhZ2eAB",
  "9VAtb6aZ6C0SWptylL9J", "CHvS5UAf7HwWIcIQIq3J", "CWvUKcdlqixVHUsKNOf5",
  "FuuViasZpTv5Y9RSwonJ", "PVeptNOiud0SRtuAFGHl", "SKYQEqPSXIekzpFoO5ke",
  "U4b4up1ovnP3Z61nxKBd", "earjjjStYEtfdH91oQC8", "o2h3pToFnhqTKhN1PwFp",
  "sJI1flSIN6QhZyhcksmP", "zENjWi9NnoZpu2Iv53R2",
] as const;

const ESPERADO = { clientes: 21, produtos: 13, vendas: 14, parcelas: 168, repasses: 14 } as const;

async function referenciasParaExcluir(colecao: string, ids: readonly string[]) {
  const referencias = ids.map((id) => doc(db, colecao, id));
  const snapshots = await Promise.all(referencias.map((referencia) => getDoc(referencia)));
  const ausentes = snapshots.filter((snapshot) => !snapshot.exists()).map((snapshot) => snapshot.id);
  if (ausentes.length && ausentes.length !== ids.length) {
    throw new Error(`${colecao}: pré-validação bloqueada por IDs ausentes parcialmente: ${ausentes.join(", ")}`);
  }
  return { referencias: referencias.filter((_, indice) => snapshots[indice].exists()), jaRemovido: ausentes.length === ids.length };
}

async function apagarEmLotes(referencias: DocumentReference[]) {
  let removidos = 0;
  for (let inicio = 0; inicio < referencias.length; inicio += 450) {
    const lote = writeBatch(db);
    const parte = referencias.slice(inicio, inicio + 450);
    parte.forEach((referencia) => lote.delete(referencia));
    await lote.commit();
    removidos += parte.length;
  }
  return removidos;
}

export async function removerDadosTeste() {
  console.info("[removerDadosTeste] iniciando pré-validação por IDs congelados");

  const [clientesResultado, produtosResultado, vendasResultado, parcelasSnapshot, repassesSnapshot, todasVendasSnapshot] = await Promise.all([
    referenciasParaExcluir("clientes", CLIENTE_IDS),
    referenciasParaExcluir("estoque", PRODUTO_IDS),
    referenciasParaExcluir("vendas", VENDA_IDS),
    getDocs(collection(db, "parcelas")),
    getDocs(collection(db, "repasses")),
    getDocs(collection(db, "vendas")),
  ]);

  const clientes = clientesResultado.referencias;
  const produtos = produtosResultado.referencias;
  const vendas = vendasResultado.referencias;

  const vendaIds = new Set<string>(VENDA_IDS);
  const clienteIds = new Set<string>(CLIENTE_IDS);
  const produtoIds = new Set<string>(PRODUTO_IDS);
  const parcelas = parcelasSnapshot.docs.filter((item) => vendaIds.has(String(item.data().vendaId)));
  const repasses = repassesSnapshot.docs.filter((item) => vendaIds.has(String(item.data().idVenda)));
  const vendasNaoAprovadas = todasVendasSnapshot.docs.filter((item) => {
    const venda = item.data();
    return (clienteIds.has(String(venda.clienteId)) || produtoIds.has(String(venda.produtoId))) && !vendaIds.has(item.id);
  });

  if (clientesResultado.jaRemovido && produtosResultado.jaRemovido && vendasResultado.jaRemovido && !parcelas.length && !repasses.length) {
    const removidos = { clientes: 0, produtos: 0, vendas: 0, parcelas: 0, repasses: 0 };
    console.info("[removerDadosTeste] migração já havia sido concluída; nenhuma escrita necessária", { removidos });
    return { removidos, referenciasOrfas: { parcelas: [], repasses: [], documentos: [] } };
  }

  const quantidades = { clientes: clientes.length, produtos: produtos.length, vendas: vendas.length, parcelas: parcelas.length, repasses: repasses.length };
  console.table(quantidades);

  if (JSON.stringify(quantidades) !== JSON.stringify(ESPERADO)) {
    throw new Error(`Pré-validação bloqueada: esperado ${JSON.stringify(ESPERADO)}, encontrado ${JSON.stringify(quantidades)}.`);
  }
  if (vendasNaoAprovadas.length) {
    throw new Error(`Pré-validação bloqueada: há vendas não aprovadas referenciando IDs selecionados: ${vendasNaoAprovadas.map((item) => item.id).join(", ")}`);
  }

  // Ordem obrigatória: dependentes antes das entidades de origem.
  const removidos = {
    parcelas: await apagarEmLotes(parcelas.map((item) => item.ref)),
    repasses: await apagarEmLotes(repasses.map((item) => item.ref)),
    vendas: await apagarEmLotes(vendas),
    produtos: await apagarEmLotes(produtos),
    clientes: await apagarEmLotes(clientes),
  };

  const [parcelasRestantes, repassesRestantes, ...documentosRestantes] = await Promise.all([
    getDocs(collection(db, "parcelas")),
    getDocs(collection(db, "repasses")),
    ...[...clientes, ...produtos, ...vendas].map((referencia) => getDoc(referencia)),
  ]);
  const referenciasOrfas = {
    parcelas: parcelasRestantes.docs.filter((item) => vendaIds.has(String(item.data().vendaId))).map((item) => item.id),
    repasses: repassesRestantes.docs.filter((item) => vendaIds.has(String(item.data().idVenda))).map((item) => item.id),
    documentos: documentosRestantes.filter((snapshot) => snapshot.exists()).map((snapshot) => snapshot.ref.path),
  };
  if (referenciasOrfas.parcelas.length || referenciasOrfas.repasses.length || referenciasOrfas.documentos.length) {
    throw new Error(`Verificação final falhou: ${JSON.stringify(referenciasOrfas)}`);
  }

  console.info("[removerDadosTeste] limpeza concluída e verificada", { removidos, referenciasOrfas });
  return { removidos, referenciasOrfas };
}

if (process.argv.includes("--executar")) {
  removerDadosTeste().catch((error) => {
    console.error("[removerDadosTeste] limpeza interrompida", error);
    process.exitCode = 1;
  });
} else {
  console.info("[removerDadosTeste] modo seguro: nenhuma exclusão executada. Use --executar somente após confirmar o backup.");
}
