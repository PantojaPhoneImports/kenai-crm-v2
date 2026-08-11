/**
 * Auditoria SOMENTE LEITURA de integridade cliente -> venda -> estoque -> parcelas.
 * Uso: GOOGLE_APPLICATION_CREDENTIALS=/caminho/service-account.json node src/scripts/diagnosticarParcelasOrfas.mjs
 */
import fs from "node:fs/promises";
import process from "node:process";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credentialPath) throw new Error("GOOGLE_APPLICATION_CREDENTIALS é obrigatório para esta auditoria somente leitura.");
if (!getApps().length) {
  const serviceAccount = JSON.parse(await fs.readFile(credentialPath, "utf8"));
  initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id });
}
const db = getFirestore();

const nomesColecoes = ["clientes", "vendas", "estoque", "parcelas", "repasses", "contratos", "cobrancas", "movimentacoes"];
const snapshots = await Promise.all(nomesColecoes.map((nome) => db.collection(nome).get()));
const colecoes = Object.fromEntries(snapshots.map((snapshot, index) => [nomesColecoes[index], snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))]));
const ids = (nome) => new Set(colecoes[nome].map((item) => item.id));
const clienteIds = ids("clientes");
const vendaIds = ids("vendas");
const produtoIds = ids("estoque");
const normalizar = (valor) => String(valor || "").normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase();
const alvo = normalizar("Neusiane Corrêa Conceição");
const relacionadosAoNome = (item) => Object.values(item).some((valor) => normalizar(valor).includes(alvo));
const orfaos = {
  vendasSemCliente: colecoes.vendas.filter((item) => item.clienteId && !clienteIds.has(String(item.clienteId))),
  vendasSemEstoque: colecoes.vendas.filter((item) => item.produtoId && !produtoIds.has(String(item.produtoId))),
  parcelasSemCliente: colecoes.parcelas.filter((item) => item.clienteId && !clienteIds.has(String(item.clienteId))),
  parcelasSemVenda: colecoes.parcelas.filter((item) => !item.vendaId || !vendaIds.has(String(item.vendaId))),
  repassesSemVenda: colecoes.repasses.filter((item) => item.idVenda && !vendaIds.has(String(item.idVenda))),
};
const vendasAlvo = colecoes.vendas.filter(relacionadosAoNome);
const idsVendasAlvo = new Set(vendasAlvo.map((item) => item.id));
const parcelasAlvo = colecoes.parcelas.filter((item) => relacionadosAoNome(item) || idsVendasAlvo.has(String(item.vendaId)));
const valoresPorVenda = Object.fromEntries([...idsVendasAlvo].map((vendaId) => {
  const itens = parcelasAlvo.filter((item) => String(item.vendaId) === vendaId);
  return [vendaId, { quantidade: itens.length, valorTotal: itens.reduce((total, item) => total + Number(item.valor || 0), 0), idsParcelas: itens.map((item) => item.id) }];
}));
const detalhesAlvo = {
  clientesComNome: colecoes.clientes.filter(relacionadosAoNome),
  vendas: vendasAlvo.map((item) => ({ id: item.id, clienteId: item.clienteId || null, clienteNome: item.clienteNome || null, produtoId: item.produtoId || null, produtoNome: item.produtoNome || null, imei: item.imei || null, valorProduto: item.valorProduto || null, entrada: item.entrada || 0, saldo: item.saldo || null, parcelas: item.parcelas || null, status: item.status || null, createdAt: item.createdAt || null, dataVenda: item.dataVenda || item.data || null })),
  estoqueRelacionado: colecoes.estoque.filter((item) => vendasAlvo.some((venda) => venda.produtoId === item.id) || relacionadosAoNome(item)).map((item) => ({ id: item.id, marca: item.marca || null, modelo: item.modelo || null, imei: item.imei || null, status: item.status || null })),
  parcelas: parcelasAlvo.map((item) => ({ id: item.id, vendaId: item.vendaId || null, clienteId: item.clienteId || null, clienteNome: item.clienteNome || null, produtoId: item.produtoId || null, produtoNome: item.produtoNome || null, parcela: item.parcela || null, totalParcelas: item.totalParcelas || null, valor: item.valor || null, status: item.status || null, vencimento: item.vencimento?.toDate?.().toISOString?.() || item.vencimento || null })),
  repasses: colecoes.repasses.filter((item) => idsVendasAlvo.has(String(item.idVenda)) || relacionadosAoNome(item)).map((item) => ({ id: item.id, vendaId: item.idVenda || null, clienteId: item.clienteId || null, clienteNome: item.clienteNome || null, produtoId: item.produtoId || null, entrada: item.entrada || 0, valorReceber: item.valorReceber || null, capitalRecuperado: item.capitalRecuperado || 0, socioRecebido: item.socioRecebido || 0, empresaRecebido: item.empresaRecebido || 0, status: item.status || null })),
  outrosDependentes: Object.fromEntries(["contratos", "cobrancas", "movimentacoes"].map((nome) => [nome, colecoes[nome].filter((item) => relacionadosAoNome(item) || idsVendasAlvo.has(String(item.vendaId)) || vendasAlvo.some((venda) => String(item.clienteId) === venda.clienteId || String(item.produtoId) === venda.produtoId)).map((item) => item.id)])),
  porVenda: valoresPorVenda,
};
const resumir = (item) => ({ id: item.id, clienteId: item.clienteId || null, vendaId: item.vendaId || item.idVenda || null, produtoId: item.produtoId || null, clienteNome: item.clienteNome || null, produtoNome: item.produtoNome || null });
console.log(JSON.stringify({
  somenteLeitura: true,
  contagensColecoes: Object.fromEntries(nomesColecoes.map((nome) => [nome, colecoes[nome].length])),
  alvo: detalhesAlvo,
  orfaos: Object.fromEntries(Object.entries(orfaos).map(([nome, itens]) => [nome, { quantidade: itens.length, documentos: itens.map(resumir) }])),
}, null, 2));
