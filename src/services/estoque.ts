import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Produto } from "@/types/produto";

const estoqueRef = collection(db, "estoque");

/**
 * Mantém a aplicação no contrato atual do Produto. Alguns documentos antigos
 * no Firestore foram salvos com `produtoNome`; eles são lidos como `nome`, sem
 * propagar o campo legado para os componentes novos.
 */
function normalizarProduto(
  id: string,
  dados: Record<string, unknown>
): Produto {
  const { produtoNome: _produtoNomeLegado, ...produto } = dados;

  return {
    ...(produto as unknown as Produto),
    id,
    nome:
      typeof produto.nome === "string"
        ? produto.nome
        : typeof _produtoNomeLegado === "string"
          ? _produtoNomeLegado
          : "",
  };
}

export async function listarProdutos(socioId?: string): Promise<Produto[]> {
  const snapshot = await getDocs(socioId ? query(estoqueRef, where("socioId", "==", socioId)) : estoqueRef);

  return snapshot.docs.map((docItem) =>
    normalizarProduto(
      docItem.id,
      docItem.data() as Record<string, unknown>
    )
  );
}

export async function buscarProdutoPorId(
  id: string
): Promise<Produto | null> {

  const snapshot = await getDoc(
    doc(db, "estoque", id)
  );

  if (!snapshot.exists()) return null;

  return normalizarProduto(
    snapshot.id,
    snapshot.data() as Record<string, unknown>
  );

}

export async function criarProduto(produto: Produto) {
  await addDoc(estoqueRef, { ...produto, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function editarProduto(
  id: string,
  produto: Partial<Produto>
) {
  await updateDoc(
    doc(db, "estoque", id),
    { ...produto, updatedAt: serverTimestamp() }
  );
}

export async function venderProduto(id: string) {
  await updateDoc(
    doc(db, "estoque", id),
    {
      status: "VENDIDO",
    }
  );
}

export async function excluirProduto(id: string) {
  await deleteDoc(
    doc(db, "estoque", id)
  );
}
