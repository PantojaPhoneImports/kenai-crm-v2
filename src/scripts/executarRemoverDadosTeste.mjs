/** Executor Node para a migração aprovada quando o tsx não está disponível. */
import { readFile } from "node:fs/promises";
import { initializeApp } from "firebase/app";
import { collection, doc, getDoc, getDocs, getFirestore, writeBatch } from "firebase/firestore";

const codigoMigracao = await readFile(new URL("./removerDadosTeste.ts", import.meta.url), "utf8");
function idsCongelados(nome) {
  const bloco = codigoMigracao.match(new RegExp(`const ${nome} = \\[([\\s\\S]*?)\\] as const;`));
  if (!bloco) throw new Error(`Não foi possível ler ${nome} da migração aprovada.`);
  return [...bloco[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

const CLIENTE_IDS = idsCongelados("CLIENTE_IDS");
const PRODUTO_IDS = idsCongelados("PRODUTO_IDS");
const VENDA_IDS = idsCongelados("VENDA_IDS");
const ESPERADO = { clientes: 21, produtos: 13, vendas: 14, parcelas: 168, repasses: 14 };
const db = getFirestore(initializeApp({
  apiKey: "AIzaSyDodu3gbTsu-B5WYsMberz1gb-8lprM2Ic",
  authDomain: "pantoja-phone-imports.firebaseapp.com",
  projectId: "pantoja-phone-imports",
  storageBucket: "pantoja-phone-imports.firebasestorage.app",
  messagingSenderId: "455745095069",
  appId: "1:455745095069:web:9570433372eb70ea221b74",
}));

async function referencias(colecao, ids) {
  const refs = ids.map((id) => doc(db, colecao, id));
  const snapshots = await Promise.all(refs.map(getDoc));
  const ausentes = snapshots.filter((item) => !item.exists()).map((item) => item.id);
  if (ausentes.length) throw new Error(`${colecao}: IDs aprovados ausentes: ${ausentes.join(", ")}`);
  return refs;
}

async function apagar(refs) {
  let total = 0;
  for (let inicio = 0; inicio < refs.length; inicio += 450) {
    const lote = writeBatch(db);
    const parte = refs.slice(inicio, inicio + 450);
    parte.forEach((ref) => lote.delete(ref));
    await lote.commit();
    total += parte.length;
  }
  return total;
}

const [clientes, produtos, vendas, parcelasSnapshot, repassesSnapshot, vendasSnapshot] = await Promise.all([
  referencias("clientes", CLIENTE_IDS), referencias("estoque", PRODUTO_IDS), referencias("vendas", VENDA_IDS),
  getDocs(collection(db, "parcelas")), getDocs(collection(db, "repasses")), getDocs(collection(db, "vendas")),
]);
const vendaIds = new Set(VENDA_IDS);
const clienteIds = new Set(CLIENTE_IDS);
const produtoIds = new Set(PRODUTO_IDS);
const parcelas = parcelasSnapshot.docs.filter((item) => vendaIds.has(String(item.data().vendaId))).map((item) => item.ref);
const repasses = repassesSnapshot.docs.filter((item) => vendaIds.has(String(item.data().idVenda))).map((item) => item.ref);
const vendasNaoAprovadas = vendasSnapshot.docs.filter((item) => {
  const venda = item.data();
  return (clienteIds.has(String(venda.clienteId)) || produtoIds.has(String(venda.produtoId))) && !vendaIds.has(item.id);
});
const quantidades = { clientes: clientes.length, produtos: produtos.length, vendas: vendas.length, parcelas: parcelas.length, repasses: repasses.length };
console.info("[executarRemoverDadosTeste] pré-validação", quantidades);
if (JSON.stringify(quantidades) !== JSON.stringify(ESPERADO)) throw new Error(`Quantidades divergentes: ${JSON.stringify(quantidades)}`);
if (vendasNaoAprovadas.length) throw new Error(`Vendas não aprovadas vinculadas: ${vendasNaoAprovadas.map((item) => item.id).join(", ")}`);

const removidos = {
  parcelas: await apagar(parcelas),
  repasses: await apagar(repasses),
  vendas: await apagar(vendas),
  produtos: await apagar(produtos),
  clientes: await apagar(clientes),
};
const [parcelasFinais, repassesFinais, ...diretosFinais] = await Promise.all([
  getDocs(collection(db, "parcelas")), getDocs(collection(db, "repasses")),
  ...[...clientes, ...produtos, ...vendas].map(getDoc),
]);
const orfaos = {
  parcelas: parcelasFinais.docs.filter((item) => vendaIds.has(String(item.data().vendaId))).map((item) => item.id),
  repasses: repassesFinais.docs.filter((item) => vendaIds.has(String(item.data().idVenda))).map((item) => item.id),
  documentos: diretosFinais.filter((item) => item.exists()).map((item) => item.ref.path),
};
if (orfaos.parcelas.length || orfaos.repasses.length || orfaos.documentos.length) throw new Error(`Órfãos encontrados: ${JSON.stringify(orfaos)}`);
console.info("[executarRemoverDadosTeste] concluído", { removidos, orfaos });
