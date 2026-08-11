import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Cliente } from "@/types/cliente";

const clientesRef = collection(db, "clientes");

export async function listarClientes(socioId?: string): Promise<Cliente[]> {

  const snapshot = await getDocs(socioId ? query(clientesRef, where("socioId", "==", socioId)) : clientesRef);

  const lista = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...(docItem.data() as Cliente),
  }));

  console.log("LISTA DE CLIENTES:");
  console.table(
    lista.map((c) => ({
      nome: c.nome,
      socioId: c.socioId,
    }))
  );

  return lista;
}

export async function criarCliente(cliente: Cliente) {

  console.log("CLIENTE RECEBIDO NO SERVICE:");
  console.log(cliente);

  const docRef = await addDoc(clientesRef, { ...cliente, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

  console.log("ID DO DOCUMENTO:", docRef.id);

  const snap = await getDoc(docRef);

  console.log("DOCUMENTO GRAVADO:");
  console.log(snap.data());

}

export async function editarCliente(

  id: string,

  cliente: Partial<Cliente>

) {

  await updateDoc(

    doc(db, "clientes", id),

    { ...cliente, updatedAt: serverTimestamp() }

  );

}

type DocumentoRelacionado = { id: string; [campo: string]: unknown };

export type ResultadoExclusaoCliente = {
  clienteId: string;
  vendas: number;
  parcelas: number;
  repasses: number;
  contratos: number;
  cobrancas: number;
  movimentacoes: number;
  estoqueRestaurado: number;
};

const LIMITE_LOTE = 450;

function semDuplicados(documentos: DocumentoRelacionado[]) {
  return [...new Map(documentos.map((documento) => [documento.id, documento])).values()];
}

async function buscarPorCampo(colecao: string, campo: string, valor: string): Promise<DocumentoRelacionado[]> {
  const snapshot = await getDocs(query(collection(db, colecao), where(campo, "==", valor)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

async function buscarPorCampoEm(colecao: string, campo: string, valores: string[]): Promise<DocumentoRelacionado[]> {
  const resultados = await Promise.all(
    Array.from({ length: Math.ceil(valores.length / 10) }, (_, indice) => valores.slice(indice * 10, indice * 10 + 10))
      .filter((grupo) => grupo.length > 0)
      .map(async (grupo) => {
        const snapshot = await getDocs(query(collection(db, colecao), where(campo, "in", grupo)));
        return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      })
  );
  return resultados.flat();
}

function temValorFinanceiro(documento: DocumentoRelacionado) {
  return ["entrada", "capitalRecuperado", "socioRecebido", "empresaRecebido", "valorPago", "valorRecebido", "valor"]
    .some((campo) => Number(documento[campo] || 0) > 0);
}

/**
 * Exclusão segura: bloqueia novas vendas para o cliente, mapeia dependências e
 * só remove o grafo quando não há histórico financeiro. Vendas com qualquer
 * entrada ou parcela paga nunca são apagadas por esta ação.
 */
export async function excluirCliente(id: string): Promise<ResultadoExclusaoCliente> {
  const clienteRef = doc(db, "clientes", id);
  const clienteSnapshot = await getDoc(clienteRef);
  if (!clienteSnapshot.exists()) throw new Error("Cliente não encontrado.");

  const statusAnterior = clienteSnapshot.data().status;
  await updateDoc(clienteRef, { status: "EXCLUINDO" });

  try {
    const [vendas, parcelasDoCliente, contratos, cobrancas, movimentacoesDoCliente] = await Promise.all([
      buscarPorCampo("vendas", "clienteId", id),
      buscarPorCampo("parcelas", "clienteId", id),
      buscarPorCampo("contratos", "clienteId", id),
      buscarPorCampo("cobrancas", "clienteId", id),
      buscarPorCampo("movimentacoes", "clienteId", id),
    ]);
    const vendaIds = vendas.map((venda) => venda.id);
    const [parcelasDasVendas, repassesDasVendas] = await Promise.all([
      buscarPorCampoEm("parcelas", "vendaId", vendaIds),
      buscarPorCampoEm("repasses", "idVenda", vendaIds),
    ]);
    const parcelas = semDuplicados([...parcelasDoCliente, ...parcelasDasVendas]);
    const repasses = semDuplicados(repassesDasVendas);

    const bloqueios = [
      ...vendas.filter(temValorFinanceiro).map((venda) => `venda ${venda.id} possui entrada/valor recebido`),
      ...parcelas.filter((parcela) => parcela.status === "PAGA" || temValorFinanceiro(parcela)).map((parcela) => `parcela ${parcela.id} possui pagamento`),
      ...repasses.filter(temValorFinanceiro).map((repasse) => `repasse ${repasse.id} possui valor financeiro`),
      ...movimentacoesDoCliente.filter(temValorFinanceiro).map((movimentacao) => `movimentação ${movimentacao.id} possui valor financeiro`),
    ];
    if (bloqueios.length) {
      throw new Error(`Cliente preservado: há histórico financeiro legítimo (${bloqueios.join(", ")}). Cancele/arquive a venda pelo fluxo financeiro apropriado.`);
    }

    const vendasPorProduto = new Map<string, number>();
    vendas.forEach((venda) => {
      if (venda.produtoId) vendasPorProduto.set(String(venda.produtoId), (vendasPorProduto.get(String(venda.produtoId)) || 0) + 1);
    });
    const produtos: Array<DocumentoRelacionado | null> = await Promise.all(
      [...vendasPorProduto.keys()].map(async (produtoId) => {
        const produto = await getDoc(doc(db, "estoque", produtoId));
        return produto.exists() ? { id: produto.id, ...(produto.data() as Record<string, unknown>) } : null;
      })
    );
    const estoqueParaRestaurar = produtos.filter((produto): produto is DocumentoRelacionado => produto !== null && produto.status === "VENDIDO" && vendasPorProduto.get(produto.id) === 1);
    const operacoes = [
      ...parcelas.map((item) => ({ tipo: "delete" as const, colecao: "parcelas", id: item.id })),
      ...repasses.map((item) => ({ tipo: "delete" as const, colecao: "repasses", id: item.id })),
      ...contratos.map((item) => ({ tipo: "delete" as const, colecao: "contratos", id: item.id })),
      ...cobrancas.map((item) => ({ tipo: "delete" as const, colecao: "cobrancas", id: item.id })),
      ...movimentacoesDoCliente.map((item) => ({ tipo: "delete" as const, colecao: "movimentacoes", id: item.id })),
      ...vendas.map((item) => ({ tipo: "delete" as const, colecao: "vendas", id: item.id })),
      ...estoqueParaRestaurar.map((item) => ({ tipo: "restore" as const, colecao: "estoque", id: item.id })),
      { tipo: "delete" as const, colecao: "clientes", id },
    ];
    for (let inicio = 0; inicio < operacoes.length; inicio += LIMITE_LOTE) {
      const lote = writeBatch(db);
      operacoes.slice(inicio, inicio + LIMITE_LOTE).forEach((operacao) => {
        const referencia = doc(db, operacao.colecao, operacao.id);
        if (operacao.tipo === "restore") lote.update(referencia, { status: "ESTOQUE" });
        else lote.delete(referencia);
      });
      await lote.commit();
    }

    return { clienteId: id, vendas: vendas.length, parcelas: parcelas.length, repasses: repasses.length, contratos: contratos.length, cobrancas: cobrancas.length, movimentacoes: movimentacoesDoCliente.length, estoqueRestaurado: estoqueParaRestaurar.length };
  } catch (erro) {
    await updateDoc(clienteRef, statusAnterior === undefined ? { status: deleteField() } : { status: statusAnterior });
    throw erro;
  }
}

export async function buscarCliente(

  nome: string

): Promise<Cliente | null> {

  const q = query(

    clientesRef,

    where("nome", "==", nome)

  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  return {

    id: snapshot.docs[0].id,

    ...(snapshot.docs[0].data() as Cliente),

  };

}

export async function buscarClientePorId(

  id: string

): Promise<Cliente | null> {

  const snapshot = await getDoc(

    doc(db, "clientes", id)

  );

  if (!snapshot.exists()) return null;

  return {

    id: snapshot.id,

    ...(snapshot.data() as Cliente),

  };

}
