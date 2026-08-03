import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const CLIENTES_ALVO = new Set(["UUUUUUUUUUUUUUUUUUUU3333", "AGORA VAI TTTT"]);
const PRODUTOS_ALVO = new Set(["UUUUUUUUUUUUUUUUUUUUUUUU", "AGORA VAI TTTT"]);
const PADRAO_TESTE = /(teste|agora vai|uuuu|aaaa|abab|999)/i;
const COLECOES = ["usuarios", "socios", "clientes", "estoque", "vendas", "parcelas", "repasses", "despesas", "movimentacoes", "contratos", "configuracoes"];

const db = getFirestore(initializeApp({
  apiKey: "AIzaSyDodu3gbTsu-B5WYsMberz1gb-8lprM2Ic",
  authDomain: "pantoja-phone-imports.firebaseapp.com",
  projectId: "pantoja-phone-imports",
  storageBucket: "pantoja-phone-imports.firebasestorage.app",
  messagingSenderId: "455745095069",
  appId: "1:455745095069:web:9570433372eb70ea221b74",
}));

const snapshots = Object.fromEntries(await Promise.all(COLECOES.map(async (nome) => [nome, await getDocs(collection(db, nome))])));
const documentos = Object.fromEntries(Object.entries(snapshots).map(([nome, snapshot]) => [nome, snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))]));
const clientes = documentos.clientes.filter((item) => CLIENTES_ALVO.has(String(item.nome)));
const produtos = documentos.estoque.filter((item) => PRODUTOS_ALVO.has(String(item.nome)));
const clienteIds = new Set(clientes.map((item) => item.id));
const produtoIds = new Set(produtos.map((item) => item.id));
const vendas = documentos.vendas.filter((item) => clienteIds.has(String(item.clienteId)) || produtoIds.has(String(item.produtoId)));
const vendaIds = new Set(vendas.map((item) => item.id));
const parcelas = documentos.parcelas.filter((item) => vendaIds.has(String(item.vendaId)));
const repasses = documentos.repasses.filter((item) => vendaIds.has(String(item.idVenda)));
const referenciasExtras = Object.fromEntries(Object.entries(documentos)
  .filter(([nome]) => !["clientes", "estoque", "vendas", "parcelas", "repasses"].includes(nome))
  .map(([nome, itens]) => [nome, itens.filter((item) => JSON.stringify(item).split('"').some((valor) => clienteIds.has(valor) || produtoIds.has(valor) || vendaIds.has(valor))).map((item) => item.id)]));
const outrosTestes = Object.fromEntries(Object.entries(documentos).map(([nome, itens]) => [nome, itens
  .filter((item) => PADRAO_TESTE.test(JSON.stringify(item)))
  .map((item) => ({ id: item.id, nome: item.nome || item.clienteNome || item.produtoNome || item.produto || "-" }))]));

const resultado = {
  alvo: { clientes: clientes.map((item) => ({ id: item.id, nome: item.nome })), produtos: produtos.map((item) => ({ id: item.id, nome: item.nome })), vendas: vendas.map((item) => ({ id: item.id, clienteId: item.clienteId, produtoId: item.produtoId })), parcelas: parcelas.map((item) => item.id), repasses: repasses.map((item) => item.id), referenciasExtras },
  outrosTestes,
};
console.info("[localizarUltimosDadosTeste] resultado", JSON.stringify(resultado, null, 2));
