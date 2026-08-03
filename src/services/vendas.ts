import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Venda } from "@/types/venda";

export async function criarVenda(venda: Partial<Omit<Venda, "id">>) {

  const produtoNome = venda.produtoNome?.trim();

  if (!produtoNome) {
    throw new Error("A venda precisa conter o nome do produto.");
  }

  const vendaParaSalvar = {
    ...venda,
    produtoNome,
    status: venda.status ?? "ATIVA",
  };

  console.info("[vendas] antes de gravar", vendaParaSalvar);

  const docRef = await addDoc(
    collection(db, "vendas"),
    vendaParaSalvar
  );

  const vendaGravada = await getDoc(doc(db, "vendas", docRef.id));
  const dadosGravados = vendaGravada.data() as Partial<Venda> | undefined;

  console.info("[vendas] leitura imediata no Firestore", {
    id: docRef.id,
    clienteId: dadosGravados?.clienteId,
    produtoId: dadosGravados?.produtoId,
    produtoNome: dadosGravados?.produtoNome,
    socioId: dadosGravados?.socioId,
    socioNome: dadosGravados?.socioNome,
    status: dadosGravados?.status,
  });

  return docRef.id;

}

export async function listarVendas(): Promise<Venda[]> {

  const snapshot = await getDocs(
    collection(db, "vendas")
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Venda, "id">),
  }));

}

export async function buscarVendaPorId(id: string): Promise<Venda | null> {
  const snapshot = await getDoc(doc(db, "vendas", id));
  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<Venda, "id">),
  };
}
