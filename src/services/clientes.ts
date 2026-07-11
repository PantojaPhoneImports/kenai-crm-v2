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
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Cliente } from "@/types/cliente";

const clientesRef = collection(db, "clientes");

export async function listarClientes(): Promise<Cliente[]> {

  const snapshot = await getDocs(clientesRef);

  return snapshot.docs.map((docItem) => ({

    id: docItem.id,

    ...(docItem.data() as Cliente),

  }));

}

export async function criarCliente(cliente: Cliente) {

  await addDoc(clientesRef, cliente);

}

export async function editarCliente(

  id: string,

  cliente: Partial<Cliente>

) {

  await updateDoc(

    doc(db, "clientes", id),

    cliente

  );

}

export async function excluirCliente(id: string) {

  await deleteDoc(

    doc(db, "clientes", id)

  );

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