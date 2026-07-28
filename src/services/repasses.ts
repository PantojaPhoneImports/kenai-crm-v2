import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

const repassesRef = collection(
  db,
  "repasses"
);

// criar repasse da venda
export async function criarRepasse(
  dados: any
) {
  const ref = await addDoc(
    repassesRef,
    dados
  );

  return ref.id;
}

// buscar repasse pela venda
export async function buscarRepasseVenda(
  idVenda: string
) {
  const q = query(
    repassesRef,
    where(
      "idVenda",
      "==",
      idVenda
    )
  );

  const snapshot =
    await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const item =
    snapshot.docs[0];

  return {
    id: item.id,
    ...(item.data() as any),
  };
}

// atualizar divisão
export async function atualizarRepasse(
  id: string,
  dados: any
) {
  await updateDoc(
    doc(
      db,
      "repasses",
      id
    ),
    dados
  );
}
export async function listarRepasses() {

  const snapshot = await getDocs(repassesRef);

  return snapshot.docs.map((docItem) => ({

    id: docItem.id,

    ...docItem.data(),

  }));

}