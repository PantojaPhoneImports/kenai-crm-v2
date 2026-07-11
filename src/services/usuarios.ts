import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

const usuariosRef = collection(db, "usuarios");

export async function listarUsuarios() {
  const snapshot = await getDocs(usuariosRef);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function criarUsuario(usuario: any) {
  await addDoc(usuariosRef, usuario);
}

export async function editarUsuario(
  id: string,
  usuario: any
) {
  await updateDoc(
    doc(db, "usuarios", id),
    usuario
  );
}

export async function excluirUsuario(id: string) {
  await deleteDoc(
    doc(db, "usuarios", id)
  );
}

export async function buscarUsuarioPorEmail(
  email: string
) {
  const q = query(
    usuariosRef,
    where("email", "==", email)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const usuario = snapshot.docs[0];

  return {
    id: usuario.id,
    ...usuario.data(),
  };
}