import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

const movimentacoesRef = collection(
  db,
  "movimentacoes"
);

export async function criarMovimentacao(
  movimentacao: any
) {

  await addDoc(
    movimentacoesRef,
    movimentacao
  );

}

export async function listarMovimentacoes() {

  const snapshot = await getDocs(
    movimentacoesRef
  );

  return snapshot.docs.map((docItem) => ({

    id: docItem.id,

    ...docItem.data(),

  }));

}
export async function listarMovimentacoesPorProduto(
  produtoId: string
) {

  const q = query(

    movimentacoesRef,

    where("produtoId", "==", produtoId),

    orderBy("createdAt", "desc")

  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({

    id: docItem.id,

    ...docItem.data(),

  }));

}

export async function listarMovimentacoesPorSocio(
  socioId: string
) {

  const q = query(

    movimentacoesRef,

    where("socioId", "==", socioId),

    orderBy("createdAt", "desc")

  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({

    id: docItem.id,

    ...docItem.data(),

  }));

}

export async function listarMovimentacoesPorCliente(
  clienteId: string
) {

  const q = query(

    movimentacoesRef,

    where("clienteId", "==", clienteId),

    orderBy("createdAt", "desc")

  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docItem) => ({

    id: docItem.id,

    ...docItem.data(),

  }));

}
export async function registrarMovimentacao({

  tipo,

  descricao,

  produtoId = "",

  produtoNome = "",

  clienteId = "",

  clienteNome = "",

  socioId = "",

  socioNome = "",

  valor = 0,

}: {

  tipo: string;

  descricao: string;

  produtoId?: string;

  produtoNome?: string;

  clienteId?: string;

  clienteNome?: string;

  socioId?: string;

  socioNome?: string;

  valor?: number;

}) {

  await criarMovimentacao({

    tipo,

    descricao,

    produtoId,

    produtoNome,

    clienteId,

    clienteNome,

    socioId,

    socioNome,

    valor,

    createdAt: new Date(),

  });

}