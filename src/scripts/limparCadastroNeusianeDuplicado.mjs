/** Limpeza cirúrgica, com diagnóstico e backup locais. Requer GOOGLE_APPLICATION_CREDENTIALS. */
import fs from "node:fs/promises";
import process from "node:process";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const aplicar = process.argv.includes("--apply");
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credentialPath) throw new Error("GOOGLE_APPLICATION_CREDENTIALS é obrigatório.");
if (!getApps().length) {
  const serviceAccount = JSON.parse(await fs.readFile(credentialPath, "utf8"));
  initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id });
}
const db = getFirestore();
const clienteAtualId = "fiiLeHnQ8a3oFtwcUQCo";
const clienteOrfaoId = "YGEWgOoT4ZkBt7kxfSX8";
const vendaIds = ["Oy6cD8V5o1SYItMSq6OC", "cELZmCRxSsnGvjDRjTfg"];
const normalizar = (valor) => String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
const serializar = (valor) => {
  if (valor?.toDate) return { __timestamp: valor.toDate().toISOString() };
  if (Array.isArray(valor)) return valor.map(serializar);
  if (valor && typeof valor === "object") return Object.fromEntries(Object.entries(valor).map(([chave, item]) => [chave, serializar(item)]));
  return valor;
};
const docs = async (colecao) => (await db.collection(colecao).get()).docs.map((item) => ({ id: item.id, ...item.data() }));
const [clientes, vendas, parcelas, repasses, contratos, cobrancas, movimentacoes, estoque] = await Promise.all(
  ["clientes", "vendas", "parcelas", "repasses", "contratos", "cobrancas", "movimentacoes", "estoque"].map(docs)
);
const clienteAtual = clientes.find((item) => item.id === clienteAtualId);
const vendasAlvo = vendas.filter((item) => vendaIds.includes(item.id));
const parcelasAlvo = parcelas.filter((item) => vendaIds.includes(String(item.vendaId)));
const repassesAlvo = repasses.filter((item) => vendaIds.includes(String(item.idVenda)));
const contratosAlvo = contratos.filter((item) => item.clienteId === clienteOrfaoId || vendaIds.includes(String(item.vendaId)));
const cobrancasAlvo = cobrancas.filter((item) => item.clienteId === clienteOrfaoId || vendaIds.includes(String(item.vendaId)));
const movimentacoesAlvo = movimentacoes.filter((item) => item.clienteId === clienteOrfaoId || vendaIds.includes(String(item.vendaId)));
const produtoIds = vendasAlvo.map((item) => String(item.produtoId)).filter(Boolean);
const estoqueAlvo = estoque.filter((item) => produtoIds.includes(item.id));
const outrasVendasMesmoEstoque = vendas.filter((item) => !vendaIds.includes(item.id) && produtoIds.includes(String(item.produtoId)));
const clientesMesmoNomeCpf = clientes.filter((item) => normalizar(item.nome) === normalizar("Neusiane Corrêa Conceição") || (clienteAtual?.cpf && normalizar(item.cpf) === normalizar(clienteAtual.cpf)));
const valido = clienteAtual && vendasAlvo.length === 2 && vendasAlvo.every((item) => item.clienteId === clienteOrfaoId) && parcelasAlvo.length === 24 && repassesAlvo.length === 2 && outrasVendasMesmoEstoque.length === 0 && clientesMesmoNomeCpf.length === 1;
const relatorio = {
  somenteLeitura: !aplicar,
  valido,
  comparacao: {
    clienteAtual: clienteAtual ? { id: clienteAtual.id, nome: clienteAtual.nome, cpf: clienteAtual.cpf, telefone: clienteAtual.telefone, socioId: clienteAtual.socioId, socioNome: clienteAtual.socioNome } : null,
    clienteOrfaoExiste: clientes.some((item) => item.id === clienteOrfaoId),
    clientesMesmoNomeCpf: clientesMesmoNomeCpf.map((item) => item.id),
  },
  alvos: {
    vendas: vendasAlvo.map((item) => ({ id: item.id, clienteId: item.clienteId, produtoId: item.produtoId, produtoNome: item.produtoNome, imei: item.imei, valorProduto: item.valorProduto, entrada: item.entrada, socioId: item.socioId, socioNome: item.socioNome })),
    parcelas: parcelasAlvo.map((item) => item.id), repasses: repassesAlvo.map((item) => item.id), contratos: contratosAlvo.map((item) => item.id), cobrancas: cobrancasAlvo.map((item) => item.id), movimentacoes: movimentacoesAlvo.map((item) => item.id),
    estoque: estoqueAlvo.map((item) => ({ id: item.id, imei: item.imei, status: item.status })),
    outrasVendasMesmoEstoque: outrasVendasMesmoEstoque.map((item) => item.id),
  },
};
if (!valido) { console.log(JSON.stringify(relatorio, null, 2)); throw new Error("Validação de segurança falhou; nenhuma alteração foi aplicada."); }
if (!aplicar) { console.log(JSON.stringify(relatorio, null, 2)); process.exit(0); }
await fs.mkdir("backups", { recursive: true });
const backup = { geradoEm: new Date().toISOString(), clienteOrfaoId, clienteAtualId, vendas: vendasAlvo, parcelas: parcelasAlvo, repasses: repassesAlvo, contratos: contratosAlvo, cobrancas: cobrancasAlvo, movimentacoes: movimentacoesAlvo, estoque: estoqueAlvo };
const arquivoBackup = `backups/limpeza-neusiane-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
await fs.writeFile(arquivoBackup, JSON.stringify(serializar(backup), null, 2), "utf8");
const lote = db.batch();
for (const item of parcelasAlvo) lote.delete(db.collection("parcelas").doc(item.id));
for (const item of repassesAlvo) lote.delete(db.collection("repasses").doc(item.id));
for (const item of contratosAlvo) lote.delete(db.collection("contratos").doc(item.id));
for (const item of cobrancasAlvo) lote.delete(db.collection("cobrancas").doc(item.id));
for (const item of movimentacoesAlvo) lote.delete(db.collection("movimentacoes").doc(item.id));
for (const item of vendasAlvo) lote.delete(db.collection("vendas").doc(item.id));
for (const item of estoqueAlvo) lote.update(db.collection("estoque").doc(item.id), { status: "DISPONIVEL", updatedAt: FieldValue.serverTimestamp() });
await lote.commit();
const [vendasRestantes, parcelasRestantes, repassesRestantes] = await Promise.all([docs("vendas"), docs("parcelas"), docs("repasses")]);
const resultado = {
  ...relatorio,
  somenteLeitura: false,
  backup: arquivoBackup,
  verificacao: {
    vendasAlvoRestantes: vendasRestantes.filter((item) => vendaIds.includes(item.id)).map((item) => item.id),
    parcelasAlvoRestantes: parcelasRestantes.filter((item) => vendaIds.includes(String(item.vendaId))).map((item) => item.id),
    repassesAlvoRestantes: repassesRestantes.filter((item) => vendaIds.includes(String(item.idVenda))).map((item) => item.id),
    clienteAtualExiste: (await db.collection("clientes").doc(clienteAtualId).get()).exists,
    estoque: await Promise.all(estoqueAlvo.map(async (item) => { const atual = await db.collection("estoque").doc(item.id).get(); return { id: item.id, existe: atual.exists, status: atual.data()?.status || null }; })),
  },
};
console.log(JSON.stringify(resultado, null, 2));
