/**
 * Backup local, somente leitura, para projetos Firestore sem Export/Import.
 * Executar: node src/scripts/backupFirestore.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";
import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDodu3gbTsu-B5WYsMberz1gb-8lprM2Ic",
  authDomain: "pantoja-phone-imports.firebaseapp.com",
  projectId: "pantoja-phone-imports",
  storageBucket: "pantoja-phone-imports.firebasestorage.app",
  messagingSenderId: "455745095069",
  appId: "1:455745095069:web:9570433372eb70ea221b74",
};

const COLECOES = [
  "usuarios", "socios", "clientes", "estoque", "vendas", "parcelas", "repasses",
  "despesas", "movimentacoes", "contratos", "configuracoes",
];

function serializar(valor) {
  if (valor instanceof Timestamp) {
    return { __firestoreType: "Timestamp", seconds: valor.seconds, nanoseconds: valor.nanoseconds, iso: valor.toDate().toISOString() };
  }
  if (valor instanceof Date) return { __firestoreType: "Date", iso: valor.toISOString() };
  if (Array.isArray(valor)) return valor.map(serializar);
  if (valor && typeof valor === "object") {
    if (typeof valor.toBase64 === "function") return { __firestoreType: "Bytes", base64: valor.toBase64() };
    if (typeof valor.path === "string" && valor.firestore) return { __firestoreType: "DocumentReference", path: valor.path };
    if (typeof valor.latitude === "number" && typeof valor.longitude === "number") {
      return { __firestoreType: "GeoPoint", latitude: valor.latitude, longitude: valor.longitude };
    }
    return Object.fromEntries(Object.entries(valor).map(([chave, item]) => [chave, serializar(item)]));
  }
  return valor;
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const geradoEm = new Date();

console.info("[backupFirestore] iniciando exportação somente leitura", { colecoes: COLECOES });
const resultados = await Promise.all(COLECOES.map(async (nome) => {
  const snapshot = await getDocs(collection(db, nome));
  return [nome, snapshot.docs.map((item) => ({ id: item.id, data: serializar(item.data()) }))];
}));

const colecoes = Object.fromEntries(resultados);
const contagens = Object.fromEntries(Object.entries(colecoes).map(([nome, documentos]) => [nome, documentos.length]));
const conteudo = JSON.stringify({
  formato: "kenai-crm-firestore-backup/v1",
  projeto: firebaseConfig.projectId,
  geradoEm: geradoEm.toISOString(),
  colecoes,
}, null, 2);
const checksumSha256 = createHash("sha256").update(conteudo).digest("hex");
const arquivo = `firestore-backup-${geradoEm.toISOString().replace(/[:.]/g, "-")}.json`;
const diretorio = resolve(process.cwd(), "backups");
const destino = join(diretorio, arquivo);

await mkdir(diretorio, { recursive: true });
await writeFile(destino, `${JSON.stringify({ checksumSha256, contagens, backup: JSON.parse(conteudo) }, null, 2)}\n`, "utf8");

console.info("[backupFirestore] backup concluído", { destino, checksumSha256, contagens });
