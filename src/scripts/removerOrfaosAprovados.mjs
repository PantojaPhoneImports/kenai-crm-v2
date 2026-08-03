import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, writeBatch } from "firebase/firestore";

const VENDA_INEXISTENTE_ID = "eJEQtW1fuQRm3GsjyXN2";
const PARCELA_IDS = [
  "5enbIKWKIGbs7VYfAoam", "75RLyjg0zR1FDbXRJtRv", "GySss0UHbrzegURhPGBZ",
  "HwBpufj4h5DrC6tL9lwc", "LqRAB9vVHkcvs0oyiu76", "Pw27OGXYlHABOvegI9lb",
  "Vw4PPHMPlZeoXk5ACgSo", "X80RryV5xAZu40pxPbxZ", "bSLgW5gBEeGfXuNixNjQ",
  "jvvFtMBjPFhZNZeLe94z", "kw3r88TOzbF5W6OAvCd8", "tqWmWab5rPD3C8X7R1fB",
];
const REPASSE_IDS = ["iGP5LV8ikxLz2E47ogdv"];

const db = getFirestore(initializeApp({
  apiKey: "AIzaSyDodu3gbTsu-B5WYsMberz1gb-8lprM2Ic",
  authDomain: "pantoja-phone-imports.firebaseapp.com",
  projectId: "pantoja-phone-imports",
  storageBucket: "pantoja-phone-imports.firebasestorage.app",
  messagingSenderId: "455745095069",
  appId: "1:455745095069:web:9570433372eb70ea221b74",
}));

const venda = await getDoc(doc(db, "vendas", VENDA_INEXISTENTE_ID));
if (venda.exists()) throw new Error(`Bloqueado: a venda ${VENDA_INEXISTENTE_ID} existe e não deve ser removida por esta auditoria.`);

const parcelas = PARCELA_IDS.map((id) => doc(db, "parcelas", id));
const repasses = REPASSE_IDS.map((id) => doc(db, "repasses", id));
const snapshots = await Promise.all([...parcelas, ...repasses].map(getDoc));
const ausentes = snapshots.filter((item) => !item.exists()).map((item) => item.ref.path);
if (ausentes.length) throw new Error(`Bloqueado: documentos aprovados ausentes: ${ausentes.join(", ")}`);

const lote = writeBatch(db);
[...parcelas, ...repasses].forEach((referencia) => lote.delete(referencia));
await lote.commit();
console.info("[removerOrfaosAprovados] concluído", { parcelas: parcelas.length, repasses: repasses.length });
