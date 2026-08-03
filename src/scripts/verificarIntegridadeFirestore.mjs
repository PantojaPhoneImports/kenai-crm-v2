/** Auditoria somente leitura das referências financeiras após limpeza. */
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const db = getFirestore(initializeApp({
  apiKey: "AIzaSyDodu3gbTsu-B5WYsMberz1gb-8lprM2Ic",
  authDomain: "pantoja-phone-imports.firebaseapp.com",
  projectId: "pantoja-phone-imports",
  storageBucket: "pantoja-phone-imports.firebasestorage.app",
  messagingSenderId: "455745095069",
  appId: "1:455745095069:web:9570433372eb70ea221b74",
}));

const [clientes, produtos, vendas, parcelas, repasses] = await Promise.all(
  ["clientes", "estoque", "vendas", "parcelas", "repasses"].map((nome) => getDocs(collection(db, nome)))
);
const ids = (snapshot) => new Set(snapshot.docs.map((item) => item.id));
const clienteIds = ids(clientes);
const produtoIds = ids(produtos);
const vendaIds = ids(vendas);
const inconsistencias = {
  vendasSemCliente: vendas.docs.filter((item) => item.data().clienteId && !clienteIds.has(String(item.data().clienteId))).map((item) => item.id),
  vendasSemProduto: vendas.docs.filter((item) => item.data().produtoId && !produtoIds.has(String(item.data().produtoId))).map((item) => item.id),
  parcelasSemVenda: parcelas.docs.filter((item) => !vendaIds.has(String(item.data().vendaId))).map((item) => ({
    id: item.id,
    vendaId: item.data().vendaId || null,
    cliente: item.data().clienteNome || null,
    produto: item.data().produtoNome || null,
  })),
  repassesSemVenda: repasses.docs.filter((item) => !vendaIds.has(String(item.data().idVenda))).map((item) => ({
    id: item.id,
    vendaId: item.data().idVenda || null,
    cliente: item.data().clienteNome || null,
    produto: item.data().produto || null,
  })),
};
const totalInconsistencias = Object.values(inconsistencias).reduce((total, itens) => total + itens.length, 0);
console.info("[verificarIntegridadeFirestore] resultado", {
  contagens: { clientes: clientes.size, produtos: produtos.size, vendas: vendas.size, parcelas: parcelas.size, repasses: repasses.size },
  inconsistencias,
  totalInconsistencias,
});
console.info("[verificarIntegridadeFirestore] inconsistências detalhadas", JSON.stringify(inconsistencias, null, 2));
if (totalInconsistencias) process.exitCode = 1;
