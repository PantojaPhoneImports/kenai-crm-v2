import { initializeApp } from "firebase/app";
import { collection, doc, getDoc, getDocs, getFirestore, writeBatch } from "firebase/firestore";

const CLIENTE_IDS = ["74TEiOMsWmQEqoVtvRrv", "TfrIohYauMwvMclIYV7K"];
const PRODUTO_IDS = ["HQkM1bPfxD1swq70HwLQ", "agjjvNkvZeZjw7PU7F47", "dPyyNVDh1v4vRXiY8KTs"];
const db = getFirestore(initializeApp({
  apiKey: "AIzaSyDodu3gbTsu-B5WYsMberz1gb-8lprM2Ic", authDomain: "pantoja-phone-imports.firebaseapp.com",
  projectId: "pantoja-phone-imports", storageBucket: "pantoja-phone-imports.firebasestorage.app",
  messagingSenderId: "455745095069", appId: "1:455745095069:web:9570433372eb70ea221b74",
}));

const [clientesSnapshot, produtosSnapshot, vendas] = await Promise.all([
  Promise.all(CLIENTE_IDS.map((id) => getDoc(doc(db, "clientes", id)))),
  Promise.all(PRODUTO_IDS.map((id) => getDoc(doc(db, "estoque", id)))),
  getDocs(collection(db, "vendas")),
]);
const ausentesClientes = clientesSnapshot.filter((item) => !item.exists()).map((item) => item.ref.path);
const ausentesProdutos = produtosSnapshot.filter((item) => !item.exists()).map((item) => item.ref.path);
if ((ausentesClientes.length && ausentesClientes.length !== CLIENTE_IDS.length) || (ausentesProdutos.length && ausentesProdutos.length !== PRODUTO_IDS.length)) {
  throw new Error(`Pré-validação bloqueada; IDs ausentes parcialmente: ${[...ausentesClientes, ...ausentesProdutos].join(", ")}`);
}
const clienteIds = new Set(CLIENTE_IDS);
const produtoIds = new Set(PRODUTO_IDS);
const dependencias = vendas.docs.filter((item) => clienteIds.has(String(item.data().clienteId)) || produtoIds.has(String(item.data().produtoId))).map((item) => item.id);
if (dependencias.length) throw new Error(`Pré-validação bloqueada; vendas vinculadas encontradas: ${dependencias.join(", ")}`);
if (ausentesClientes.length === CLIENTE_IDS.length && ausentesProdutos.length === PRODUTO_IDS.length) {
  console.info("[removerProdutosClientesFinais] migração já concluída; nenhuma escrita necessária");
  process.exit(0);
}
const clientes = clientesSnapshot.map((item) => item.ref);
const produtos = produtosSnapshot.map((item) => item.ref);

const lote = writeBatch(db);
PRODUTO_IDS.forEach((id) => lote.delete(doc(db, "estoque", id)));
CLIENTE_IDS.forEach((id) => lote.delete(doc(db, "clientes", id)));
await lote.commit();
console.info("[removerProdutosClientesFinais] concluído", { clientes: CLIENTE_IDS.length, produtos: PRODUTO_IDS.length, vendas: 0, parcelas: 0, repasses: 0 });
