import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export interface Socio {

  id?: string;

  nome: string;

  cpf: string;

  telefone: string;

  email: string;

  percentual: number;

  pix: string;

  status: string;

  usuario: string;

  senha: string;

  perfil: string;

}

const sociosRef = collection(db, "socios");

export async function listarSocios(): Promise<Socio[]> {

  const snapshot = await getDocs(sociosRef);

  return snapshot.docs.map((docItem) => ({

    id: docItem.id,

    ...(docItem.data() as Omit<Socio, "id">),

  }));

}

export async function criarSocio(
  socio: Socio
) {

  await addDoc(
    sociosRef,
    socio
  );

}

export async function editarSocio(
  id: string,
  socio: Socio
) {

  await updateDoc(
    doc(db, "socios", id),
    {
      ...socio,
    }
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
): Promise<Socio | null> {

  const referencia = doc(db, "socios", id);

  const snapshot = await getDoc(referencia);

  if (!snapshot.exists()) {

    return null;

  }

  return {

    id: snapshot.id,

    ...(snapshot.data() as Omit<Socio, "id">),

  };

}