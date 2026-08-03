import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";

import { db } from "../lib/firebase";

const COLECOES = [
  "usuarios",
  "clientes",
  "estoque",
  "vendas",
  "parcelas",
  "repasses",
];

// O ID canônico é o ID real do documento `socios/Diogo` no Firestore.
const ID_DIOGO_LEGADO = "x2Yblt8YBWjLqLlbJJg5";
const ID_DIOGO_CANONICO = "x2Yblt8YBWjLqLIbJJg5";
const NOME_DIOGO = "Diogo";

async function executar() {
  let total = 0;

  for (const nomeColecao of COLECOES) {
    const snap = await getDocs(collection(db, nomeColecao));
    const documentos = snap.docs.filter(
      (documento) => documento.data().socioId === ID_DIOGO_LEGADO
    );

    for (let inicio = 0; inicio < documentos.length; inicio += 400) {
      const batch = writeBatch(db);

      documentos.slice(inicio, inicio + 400).forEach((documento) => {
        batch.update(doc(db, nomeColecao, documento.id), {
          socioId: ID_DIOGO_CANONICO,
          socioNome: NOME_DIOGO,
        });
      });

      await batch.commit();
    }

    total += documentos.length;
    console.log(`${nomeColecao}: ${documentos.length} corrigidos`);
  }

  console.log(`Total: ${total}`);
}

executar().catch(console.error);
