import {
  collection,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Configuracao } from "@/types/configuracao";

const configuracoesRef = collection(db, "configuracoes");

export async function obterConfiguracao() {

  const snapshot = await getDocs(configuracoesRef);

  if (snapshot.empty) return null;

  const documento = snapshot.docs[0];

  return {
    id: documento.id,
    ...(documento.data() as Configuracao),
  };

}

export async function salvarConfiguracao(
  configuracao: Configuracao
) {

  const snapshot = await getDocs(configuracoesRef);

  if (snapshot.empty) {

    await setDoc(
      doc(configuracoesRef),
      configuracao
    );

    return;

  }

  const documento = snapshot.docs[0];

  await setDoc(
    doc(db, "configuracoes", documento.id),
    configuracao
  );

}