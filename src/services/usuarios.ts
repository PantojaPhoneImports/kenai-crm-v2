import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Usuario } from "@/types/usuario";

const USUARIOS_PATH = "usuarios";
const usuariosRef = collection(db, USUARIOS_PATH);

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

export async function criarUsuario(usuario: Usuario, firebaseAuthUid: string) {
  const uid = firebaseAuthUid.trim();
  if (!uid) throw new Error("O UID do Firebase Auth é obrigatório para criar um usuário.");
  await setDoc(doc(db, USUARIOS_PATH, uid), { ...usuario, id: uid });
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
  email: string,
  contexto?: { uid?: string }
): Promise<Usuario | null> {
  const consulta = {
    caminhoFirestore: `/databases/(default)/documents/${USUARIOS_PATH}`,
    colecao: USUARIOS_PATH,
    operador: "where",
    campo: "email",
    comparador: "==",
    valor: email,
    uidAutenticado: contexto?.uid ?? null,
    emailAutenticado: email,
  };
  console.info("[usuarios:busca] iniciando leitura da coleção usuarios", consulta);
  const q = query(
    usuariosRef,
    where("email", "==", email)
  );

  try {
    const snapshot = await getDocs(q);
    console.info("[usuarios:busca] consulta concluída", {
      ...consulta,
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
      ...consulta,
      code: firebaseError.code,
      message: firebaseError.message,
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });
    throw error;
  }
}

/** Busca o perfil pelo ID canônico do usuário no Firebase Auth. */
export async function buscarUsuarioPorUid(uid: string): Promise<Usuario | null> {
  const caminho = `/databases/(default)/documents/${USUARIOS_PATH}/${uid}`;
  const inicio = performance.now();
  console.info("[usuarios:busca-uid] iniciando leitura", { uid, caminho });

  try {
    const snapshot = await getDoc(doc(db, USUARIOS_PATH, uid));
    const dados = snapshot.exists()
      ? ({ id: snapshot.id, ...(snapshot.data() as Omit<Usuario, "id">) })
      : null;
    console.info("[usuarios:busca-uid] consulta concluída", {
      uid,
      caminho,
      encontrado: Boolean(dados),
      duracaoMs: Math.round(performance.now() - inicio),
    });
    return dados;
  } catch (error) {
    const firebaseError = error as { code?: string; message?: string };
    console.error("[usuarios:busca-uid] falha na leitura", {
      uid,
      caminho,
      code: firebaseError.code,
      message: firebaseError.message,
      stack: error instanceof Error ? error.stack : undefined,
      error,
      duracaoMs: Math.round(performance.now() - inicio),
    });
    throw error;
  }
}

/** Mantém o usuário de acesso ligado ao ID canônico de `socios`. */
export async function vincularUsuarioAoSocio(
  email: string,
  socioId: string,
  nome: string,
  firebaseAuthUid: string
) {
  const uid = firebaseAuthUid.trim();
  if (!uid) throw new Error("O UID do Firebase Auth é obrigatório para vincular um sócio.");
  await setDoc(doc(db, USUARIOS_PATH, uid), {
    email,
    nome,
    perfil: "SOCIO",
    ativo: true,
    socioId,
    id: uid,
  } satisfies Usuario);
  return uid;
}
