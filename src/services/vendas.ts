import {
  addDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export async function criarVenda(venda: any) {

  const docRef = await addDoc(
    collection(db, "vendas"),
    venda
  );

  return docRef.id;

}

export async function listarVendas() {

  const snapshot = await getDocs(
    collection(db, "vendas")
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

}