#!/usr/bin/env node

/**
 * Migra usuarios/{id-aleatorio} para usuarios/{firebaseAuthUid}.
 *
 * O modo padrão é somente leitura. O modo --apply cria primeiro um backup
 * completo, mostra o resumo e exige confirmação interativa antes de gravar.
 * Rollback: node scripts/migrate-usuarios-to-uid.mjs --rollback <backup.json>
 * Requer firebase-admin e credenciais em GOOGLE_APPLICATION_CREDENTIALS.
 */
import fs from "node:fs/promises";
import process from "node:process";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, GeoPoint, Timestamp } from "firebase-admin/firestore";

const apply = process.argv.includes("--apply");
const rollbackIndex = process.argv.indexOf("--rollback");
const rollbackFile = rollbackIndex >= 0 ? process.argv[rollbackIndex + 1] : null;

if (apply && rollbackFile) throw new Error("Use --apply ou --rollback, não ambos.");
if (rollbackIndex >= 0 && !rollbackFile) throw new Error("Informe o arquivo de backup para rollback.");

const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!getApps().length) {
  if (!credentialPath) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS não está disponível nesta sessão.");
  }
  const serviceAccount = JSON.parse(await fs.readFile(credentialPath, "utf8"));
  if (!serviceAccount.project_id) {
    throw new Error("O JSON da Service Account não contém project_id.");
  }
  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

const db = getFirestore();
const auth = getAuth();
const usuariosCollection = db.collection("usuarios");

function timestampNome() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}-${p(d.getMinutes())}`;
}

function encode(value) {
  if (value instanceof Timestamp) return { __tipo: "timestamp", millis: value.toMillis() };
  if (value instanceof GeoPoint) return { __tipo: "geopoint", latitude: value.latitude, longitude: value.longitude };
  if (Array.isArray(value)) return value.map(encode);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)]));
  return value;
}

function decode(value) {
  if (Array.isArray(value)) return value.map(decode);
  if (value && typeof value === "object") {
    if (value.__tipo === "timestamp") return Timestamp.fromMillis(value.millis);
    if (value.__tipo === "geopoint") return new GeoPoint(value.latitude, value.longitude);
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, decode(v)]));
  }
  return value;
}

async function confirmar(pergunta) {
  const rl = readline.createInterface({ input, output });
  const resposta = await rl.question(`${pergunta} Digite CONFIRMAR para continuar: `);
  rl.close();
  return resposta.trim().toUpperCase() === "CONFIRMAR";
}

async function criarBackup(snapshot) {
  await fs.mkdir("backups", { recursive: true });
  const arquivo = `backups/usuarios-backup-${timestampNome()}.json`;
  const backup = {
    collection: "usuarios",
    createdAt: new Date().toISOString(),
    documents: snapshot.docs.map((item) => ({ id: item.id, data: encode(item.data()) })),
  };
  await fs.writeFile(arquivo, JSON.stringify(backup, null, 2), "utf8");
  return arquivo;
}

async function carregarUsuariosAuth() {
  const porEmail = new Map();
  let pageToken;
  let quantidade = 0;
  do {
    const page = await auth.listUsers(1000, pageToken);
    quantidade += page.users.length;
    for (const user of page.users) {
      if (user.email) porEmail.set(user.email.toLowerCase(), user.uid);
    }
    pageToken = page.pageToken;
  } while (pageToken);
  return { porEmail, quantidade };
}

async function rollback(arquivo) {
  const backup = JSON.parse(await fs.readFile(arquivo, "utf8"));
  if (backup.collection !== "usuarios" || !Array.isArray(backup.documents)) {
    throw new Error("Backup inválido para a coleção usuarios.");
  }
  console.log(`Backup contém ${backup.documents.length} documentos.`);
  if (!(await confirmar("O rollback substituirá a coleção usuarios atual."))) {
    console.log("Rollback cancelado.");
    return;
  }
  const atual = await usuariosCollection.get();
  const operacoes = [
    ...atual.docs.map((item) => ({ tipo: "delete", ref: item.ref })),
    ...backup.documents.map((item) => ({ tipo: "set", ref: usuariosCollection.doc(item.id), data: decode(item.data) })),
  ];
  for (let inicio = 0; inicio < operacoes.length; inicio += 450) {
    const batch = db.batch();
    for (const operacao of operacoes.slice(inicio, inicio + 450)) {
      if (operacao.tipo === "delete") batch.delete(operacao.ref);
      else batch.set(operacao.ref, operacao.data);
    }
    await batch.commit();
  }
  console.log(`Rollback concluído: ${backup.documents.length} documentos restaurados.`);
}

if (rollbackFile) {
  await rollback(rollbackFile);
  process.exit(0);
}

const firestoreSnapshot = await usuariosCollection.get();
const { porEmail, quantidade: quantidadeAuth } = await carregarUsuariosAuth();
const correspondencias = [];
const conflitos = [];
const semCorrespondencia = [];

for (const item of firestoreSnapshot.docs) {
  const data = item.data();
  const email = typeof data.email === "string" ? data.email.toLowerCase() : "";
  const uid = porEmail.get(email);
  if (!uid) {
    semCorrespondencia.push({ sourceId: item.id, email: data.email ?? null });
    continue;
  }
  const destino = await usuariosCollection.doc(uid).get();
  if (destino.exists && destino.id === item.id) {
    correspondencias.push({ sourceId: item.id, uid, email, data, jaCanonico: true });
    continue;
  }
  if (destino.exists && destino.id !== item.id) {
    conflitos.push({ sourceId: item.id, uid, email });
    continue;
  }
  correspondencias.push({ sourceId: item.id, uid, email, data });
}

let backupFile = null;
if (apply) backupFile = await criarBackup(firestoreSnapshot);

console.log(`\nForam encontrados:\n${firestoreSnapshot.size} usuários Firestore\n${quantidadeAuth} usuários Auth\n${correspondencias.length} correspondências\n${conflitos.length} conflitos\n${semCorrespondencia.length} sem correspondência`);
if (backupFile) console.log(`Backup criado em: ${backupFile}`);

if (!apply) {
  console.log("Modo dry-run: nenhuma alteração foi executada.");
  process.exit(0);
}

if (!(await confirmar("Deseja continuar?"))) {
  console.log("Migração cancelada. O backup permanece disponível.");
  process.exit(0);
}

for (const item of correspondencias) {
  if (!item.jaCanonico) await usuariosCollection.doc(item.uid).create(item.data);
}
console.log(`Migração concluída: ${correspondencias.length} documentos criados.`);
