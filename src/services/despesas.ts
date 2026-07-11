import {

  addDoc,

  collection,

  deleteDoc,

  doc,

  getDocs,

  updateDoc,

} from "firebase/firestore";

import { db } from "../lib/firebase";

const despesasRef = collection(db, "despesas");

export async function listarDespesas() {

  const snapshot = await getDocs(despesasRef);

  return snapshot.docs.map((docItem) => ({

    id: docItem.id,

    ...docItem.data(),

  }));

}

export async function criarDespesa(

  despesa: any

) {

  await addDoc(

    despesasRef,

    despesa

  );

}
export async function editarDespesa(

  id: string,

  despesa: any

) {

  await updateDoc(

    doc(db, "despesas", id),

    despesa

  );

}

export async function excluirDespesa(

  id: string

) {

  await deleteDoc(

    doc(db, "despesas", id)

  );

}

export async function buscarDespesa(

  id: string

) {

  const snapshot = await getDocs(

    despesasRef

  );

  const despesa = snapshot.docs.find(

    (docItem) => docItem.id === id

  );

  if (!despesa) return null;

  return {

    id: despesa.id,

    ...despesa.data(),

  };

}