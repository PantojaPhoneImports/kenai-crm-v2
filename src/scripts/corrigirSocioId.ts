import { collection, doc, getDocs, writeBatch } from "firebase/firestore";

import { db } from "../lib/firebase";

const ID_ANTONIO_LEGADO = "ILzXDRdnbocAro5SFwWv";
const ID_ANTONIO_CANONICO = "lLzXDRdnbocAro5SFwWv";
const NOME_ANTONIO = "Antonio Pai";

const colecoes = [
  "usuarios",
  "clientes",
  "estoque",
  "vendas",
  "parcelas",
  "repasses",
];

async function executar() {
  for (const nomeColecao of colecoes) {
    const snapshot = await getDocs(collection(db, nomeColecao));
    const documentos = snapshot.docs.filter(
      (documento) => documento.data().socioId === ID_ANTONIO_LEGADO
    );

    for (let inicio = 0; inicio < documentos.length; inicio += 400) {
      const batch = writeBatch(db);

      documentos.slice(inicio, inicio + 400).forEach((documento) => {
        batch.update(doc(db, nomeColecao, documento.id), {
          socioId: ID_ANTONIO_CANONICO,
          socioNome: NOME_ANTONIO,
        });
      });

      await batch.commit();
    }

    console.log(`${nomeColecao}: ${documentos.length} atualizados`);
  }
}

executar().catch(console.error);
