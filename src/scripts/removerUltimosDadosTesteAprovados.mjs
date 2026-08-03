import { initializeApp } from "firebase/app";
import { collection, doc, getDoc, getDocs, getFirestore, writeBatch } from "firebase/firestore";

// IDs congelados pela varredura de leitura; a remoção não usa nomes.
const CLIENTE_IDS = ["77qR92ijOfUsqmKfpumM", "ucue6OUO4pqp0TSmbqaA"];
const PRODUTO_IDS = ["OYB0xhYKaFgaDR7ymGNi", "Qa5qOGjmRgYEdj6Kzmnj"];
const VENDA_IDS = ["2Y8eE0IWUewc8fKbdryA", "NcR7OZIMbHCPkycWY8Zs"];
const ESPERADO = { clientes: 2, produtos: 2, vendas: 2, parcelas: 24, repasses: 2 };

const db = getFirestore(initializeApp({
  apiKey: "AIzaSyDodu3gbTsu-B5WYsMberz1gb-8lprM2Ic", authDomain: "pantoja-phone-imports.firebaseapp.com",
  projectId: "pantoja-phone-imports", storageBucket: "pantoja-phone-imports.firebasestorage.app",
  messagingSenderId: "455745095069", appId: "1:455745095069:web:9570433372eb70ea221b74",
}));
async function refs(colecao, ids) {
  const resultado = ids.map((id) => doc(db, colecao, id));
  const snapshots = await Promise.all(resultado.map(getDoc));
  const ausentes = snapshots.filter((item) => !item.exists()).map((item) => item.id);
  if (ausentes.length === ids.length) return { referencias: [], jaRemovido: true };
  if (ausentes.length) throw new Error(`${colecao}: IDs aprovados ausentes parcialmente: ${ausentes.join(", ")}`);
  return { referencias: resultado, jaRemovido: false };
}
async function apagar(referencias) {
  const lote = writeBatch(db);
  referencias.forEach((referencia) => lote.delete(referencia));
  await lote.commit();
  return referencias.length;
}

const [clientesResultado, produtosResultado, vendasResultado, parcelasSnapshot, repassesSnapshot] = await Promise.all([
  refs("clientes", CLIENTE_IDS), refs("estoque", PRODUTO_IDS), refs("vendas", VENDA_IDS),
  getDocs(collection(db, "parcelas")), getDocs(collection(db, "repasses")),
]);
const clientes = clientesResultado.referencias;
const produtos = produtosResultado.referencias;
const vendas = vendasResultado.referencias;
const vendaIds = new Set(VENDA_IDS);
const parcelas = parcelasSnapshot.docs.filter((item) => vendaIds.has(String(item.data().vendaId))).map((item) => item.ref);
const repasses = repassesSnapshot.docs.filter((item) => vendaIds.has(String(item.data().idVenda))).map((item) => item.ref);
if (clientesResultado.jaRemovido && produtosResultado.jaRemovido && vendasResultado.jaRemovido && !parcelas.length && !repasses.length) {
  console.info("[removerUltimosDadosTesteAprovados] migração já concluída; nenhuma escrita necessária");
  process.exit(0);
}
const quantidades = { clientes: clientes.length, produtos: produtos.length, vendas: vendas.length, parcelas: parcelas.length, repasses: repasses.length };
if (JSON.stringify(quantidades) !== JSON.stringify(ESPERADO)) throw new Error(`Pré-validação bloqueada: ${JSON.stringify(quantidades)}`);

const removidos = {
  parcelas: await apagar(parcelas), repasses: await apagar(repasses), vendas: await apagar(vendas), produtos: await apagar(produtos), clientes: await apagar(clientes),
};
console.info("[removerUltimosDadosTesteAprovados] concluído", removidos);
