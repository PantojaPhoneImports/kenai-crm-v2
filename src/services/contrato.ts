import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../lib/firebase";

const contratosRef = collection(db, "contratos");

function arquivoParaBase64(
  arquivo: File
): Promise<string> {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.readAsDataURL(arquivo);

    reader.onload = () =>
      resolve(reader.result as string);

    reader.onerror = (erro) =>
      reject(erro);

  });

}

export async function uploadContrato(

  clienteId: string,

  socioId: string,

  arquivo: File,

  observacao: string

) {

  try {

    alert("Convertendo PDF...");

    const base64 =
      await arquivoParaBase64(
        arquivo
      );

    alert("Salvando contrato...");

    await addDoc(
      contratosRef,
      {

        clienteId,

        socioId,

        nome: arquivo.name,

        observacao,

        arquivo: base64,

        criadoEm: serverTimestamp(),

      }
    );

    alert("Contrato salvo com sucesso!");

  } catch (erro: any) {

    console.error(erro);

    alert(erro.message);

    throw erro;

  }

}
export async function listarContratos(
  clienteId: string
) {

  try {

    const q = query(
      contratosRef,
      orderBy("criadoEm", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs
      .map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }))
      .filter(
        (contrato: any) =>
          contrato.clienteId === clienteId
      );

  } catch (erro: any) {

    console.error(erro);

    alert("Erro ao listar contratos.");

    return [];

  }

}

export async function excluirContrato(
  contrato: any
) {

  try {

    await deleteDoc(
      doc(
        db,
        "contratos",
        contrato.id
      )
    );

  } catch (erro: any) {

    console.error(erro);

    alert("Erro ao excluir contrato.");

  }

}

export async function buscarContrato(
  id: string
) {

  try {

    const snapshot = await getDocs(
      contratosRef
    );

    const contrato = snapshot.docs.find(
      (docItem) =>
        docItem.id === id
    );

    if (!contrato) {

      return null;

    }

    return {

      id: contrato.id,

      ...contrato.data(),

    };

  } catch (erro: any) {

    console.error(erro);

    alert("Erro ao buscar contrato.");

    return null;

  }

}
