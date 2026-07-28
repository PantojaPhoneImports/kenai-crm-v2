import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

const DIOGO_ID = "x2Yblt8YBWjLqLlbJJg5";
const ANTONIO_ID = "ILzXDRdnbocAro5SFwWv";

async function atualizarColecao(nomeColecao: string) {

  console.log(`\nAtualizando ${nomeColecao}...`);

  const snapshot = await getDocs(
    collection(db, nomeColecao)
  );

  let alterados = 0;

  for (const item of snapshot.docs) {

    const dados: any = item.data();

    let socioId = dados.socioId;

    const texto = (
      `${dados.socioNome || ""} ${dados.nomeSocio || ""} ${dados.investidor || ""}`
    ).toLowerCase();

    if (
      texto.includes("diogo")
    ) {
      socioId = DIOGO_ID;
    }

    if (
      texto.includes("antonio")
    ) {
      socioId = ANTONIO_ID;
    }

    if (
      socioId &&
      socioId !== dados.socioId
    ) {

      await updateDoc(
        doc(db, nomeColecao, item.id),
        {
          socioId,
        }
      );

      alterados++;

      console.log(
        `${nomeColecao} -> ${item.id} atualizado`
      );

    }

  }

  console.log(
    `${nomeColecao}: ${alterados} documentos atualizados`
  );

}

export async function migrarSocios() {

  console.log("==================================");
  console.log("INICIANDO MIGRAÇÃO");
  console.log("==================================");

  await atualizarColecao("clientes");
  await atualizarColecao("estoque");
  await atualizarColecao("vendas");
  await atualizarColecao("parcelas");
  await atualizarColecao("repasses");

  console.log("==================================");
  console.log("MIGRAÇÃO FINALIZADA");
  console.log("==================================");

}