import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, Timestamp } from "firebase/firestore";

const PADRAO = /(teste|uuuu|agora vai|0000|novo clii?entes|vida|aaaa|abab|999)/i;
const COLECOES = ["usuarios", "socios", "clientes", "estoque", "vendas", "parcelas", "repasses", "despesas", "movimentacoes", "contratos", "configuracoes"];
const db = getFirestore(initializeApp({
  apiKey: "AIzaSyDodu3gbTsu-B5WYsMberz1gb-8lprM2Ic", authDomain: "pantoja-phone-imports.firebaseapp.com",
  projectId: "pantoja-phone-imports", storageBucket: "pantoja-phone-imports.firebasestorage.app",
  messagingSenderId: "455745095069", appId: "1:455745095069:web:9570433372eb70ea221b74",
}));
function textos(valor) {
  if (typeof valor === "string") return [valor];
  if (!valor || typeof valor !== "object" || valor instanceof Date || valor instanceof Timestamp) return [];
  if (Array.isArray(valor)) return valor.flatMap(textos);
  return Object.values(valor).flatMap(textos);
}
const encontrados = {};
for (const nome of COLECOES) {
  const snapshot = await getDocs(collection(db, nome));
  encontrados[nome] = snapshot.docs
    .filter((item) => textos(item.data()).some((texto) => PADRAO.test(texto)))
    .map((item) => ({ id: item.id, nome: item.data().nome || item.data().clienteNome || item.data().produtoNome || item.data().produto || "-" }));
}
console.info("[listarTextosTesteRestantes] resultado", JSON.stringify(encontrados, null, 2));
