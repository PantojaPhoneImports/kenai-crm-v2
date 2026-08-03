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
import type { Usuario } from "@/types/usuario";

const usuariosRef = collection(db, "usuarios");

function usuarioParaLog(usuario: Usuario | null) {
  if (!usuario) return null;
  const { ...dadosSeguros } = usuario as Usuario & { senha?: string };
  return {
    ...dadosSeguros,
    ...("senha" in dadosSeguros ? { senha: "[OCULTA]" } : {}),
  };
}

export async function listarUsuarios() {
  const snapshot = await getDocs(usuariosRef);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function criarUsuario(usuario: Usuario) {
  await addDoc(usuariosRef, usuario);
}

export async function editarUsuario(
  id: string,
  usuario: Partial<Usuario>
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
): Promise<Usuario | null> {
  console.info("[usuarios:busca] iniciando leitura da coleção usuarios", { email });
  const q = query(
    usuariosRef,
    where("email", "==", email)
  );

  try {
    const snapshot = await getDocs(q);
    console.info("[usuarios:busca] consulta concluída", {
      email,
      documentosEncontrados: snapshot.size,
      vazio: snapshot.empty,
    });

    if (snapshot.empty) {
      console.warn("[usuarios:busca] nenhum usuário encontrado para o e-mail", { email });
      return null;
    }

    const usuario = snapshot.docs[0];
    const dados = {
      id: usuario.id,
      ...(usuario.data() as Omit<Usuario, "id">),
    };

    console.info("[usuarios:busca] usuário encontrado", {
      usuario: usuarioParaLog(dados),
      perfil: dados.perfil,
      socioId: dados.socioId,
    });

    return dados;
  } catch (error) {
    const firebaseError = error as { code?: string; message?: string };
    console.error("[usuarios:busca] falha na leitura da coleção usuarios", {
      email,
      code: firebaseError.code,
      message: firebaseError.message,
      error,
    });
    throw error;
  }
}

/** Mantém o usuário de acesso ligado ao ID canônico de `socios`. */
export async function vincularUsuarioAoSocio(
  email: string,
  socioId: string,
  nome: string
) {
  const existente = await buscarUsuarioPorEmail(email);

  if (existente?.id) {
    await editarUsuario(existente.id, { socioId, nome, perfil: "SOCIO" });
    return existente.id;
  }

  const referencia = await addDoc(usuariosRef, {
    email,
    nome,
    perfil: "SOCIO",
    ativo: true,
    socioId,
  } satisfies Usuario);

  return referencia.id;
}
