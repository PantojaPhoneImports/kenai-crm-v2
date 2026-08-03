/**
 * Corrige exclusivamente os cinco clientes auditados sem socioId.
 * A migração é idempotente: documentos já corretos são ignorados e qualquer
 * vínculo diferente do esperado interrompe a execução sem sobrescrevê-lo.
 */
import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";

const CORRECOES = [
  { id: "2gaV4LhcW8928PeD7Osv", nome: "Josivane dos Santos Aguiar", socioId: "x2Yblt8YBWjLqLIbJJg5", socioNome: "Diogo" },
  { id: "YGEWgOoT4ZkBt7kxfSX8", nome: "Neusiane Corrêa Conceição", socioId: "x2Yblt8YBWjLqLIbJJg5", socioNome: "Diogo" },
  { id: "0eXjM2NBG2wd1NA9snTm", nome: "Carla Cristina Alves do Nascimento", socioId: "x2Yblt8YBWjLqLIbJJg5", socioNome: "Diogo" },
  { id: "xWqnsS6wdp6OV8kxSjM7", nome: "Sarah Sales Almeida", socioId: "lLzXDRdnbocAro5SFwWv", socioNome: "Antonio Pai" },
  { id: "u0TrLZhi8x3VSEXhyuNg", nome: "Gabriel Adriano Santa Brígida Cordovil", socioId: "lLzXDRdnbocAro5SFwWv", socioNome: "Antonio Pai" },
];

const db = getFirestore(initializeApp({
  apiKey: "AIzaSyDodu3gbTsu-B5WYsMberz1gb-8lprM2Ic",
  authDomain: "pantoja-phone-imports.firebaseapp.com",
  projectId: "pantoja-phone-imports",
  storageBucket: "pantoja-phone-imports.firebasestorage.app",
  messagingSenderId: "455745095069",
  appId: "1:455745095069:web:9570433372eb70ea221b74",
}));

let corrigidos = 0;
let jaCorretos = 0;

for (const correcao of CORRECOES) {
  const referencia = doc(db, "clientes", correcao.id);
  const snapshot = await getDoc(referencia);

  if (!snapshot.exists()) {
    throw new Error(`Cliente ${correcao.id} não encontrado.`);
  }

  const cliente = snapshot.data();
  if (String(cliente.nome || "").trim() !== correcao.nome) {
    throw new Error(`Cliente ${correcao.id} não corresponde ao nome auditado.`);
  }

  const jaAssociado = cliente.socioId === correcao.socioId
    && cliente.socioNome === correcao.socioNome;
  if (jaAssociado) {
    jaCorretos += 1;
    continue;
  }

  if (cliente.socioId || cliente.socioNome) {
    throw new Error(`Cliente ${correcao.id} possui vínculo inesperado e não foi alterado.`);
  }

  await updateDoc(referencia, {
    socioId: correcao.socioId,
    socioNome: correcao.socioNome,
  });
  corrigidos += 1;
}

console.info("[corrigirSocioClientesSemVinculo]", { corrigidos, jaCorretos, total: CORRECOES.length });
process.exit(0);
