import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Produto } from "@/types/produto";

const estoqueRef = collection(db, "estoque");

export async function listarProdutos(): Promise<Produto[]> {
  const snapshot = await getDocs(estoqueRef);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...(docItem.data() as Produto),
  }));
}

export async function criarProduto(produto: Produto) {
  await addDoc(estoqueRef, produto);
}

export async function editarProduto(
  id: string,
  produto: Partial<Produto>
) {
  await updateDoc(doc(db, "estoque", id), produto);
}

export async function venderProduto(id: string) {
  await updateDoc(doc(db, "estoque", id), {
    status: "VENDIDO",
  });
}

export async function excluirProduto(id: string) {
  await deleteDoc(doc(db, "estoque", id));
}