import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

const sociosRef = collection(db, "socios");

export async function listarSocios() {

  const snapshot = await getDocs(sociosRef);

  return snapshot.docs.map((docItem) => ({

    id: docItem.id,

    ...docItem.data(),

  }));

}

export async function criarSocio(
  socio: any
) {

  await addDoc(
    sociosRef,
    socio
  );

}

export async function editarSocio(
  id: string,
  socio: any
) {

  await updateDoc(
    doc(db, "socios", id),
    socio
  );

}
export async function excluirSocio(
  id: string
) {

  await deleteDoc(
    doc(db, "socios", id)
  );

}

export async function buscarSocio(
  id: string
) {

  const snapshot = await getDocs(
    sociosRef
  );

  const socio = snapshot.docs.find(
    (docItem) => docItem.id === id
  );

  if (!socio) return null;

  return {

    id: socio.id,

    ...socio.data(),

  };

}