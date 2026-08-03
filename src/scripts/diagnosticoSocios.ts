import { getDocs, collection } from "firebase/firestore";
import { db } from "../lib/firebase";

const colecoes = [
  "usuarios",
  "clientes",
  "estoque",
  "vendas",
  "parcelas",
  "repasses",
];

async function diagnosticarColecao(nome: string) {
  console.log("\n");
  console.log("====================================");
  console.log(nome.toUpperCase());
  console.log("====================================");

  const snapshot = await getDocs(collection(db, nome));

  const mapa = new Map<string, number>();

  snapshot.forEach((doc) => {
    const dados: any = doc.data();

    const id = dados.socioId || "SEM_SOCIO";

    mapa.set(id, (mapa.get(id) || 0) + 1);
  });

  console.log("\nResumo:");

  mapa.forEach((quantidade, id) => {
    console.log(id, "=>", quantidade);
  });

  console.log("\nDetalhes:");

  snapshot.forEach((doc) => {
    const dados: any = doc.data();

    console.log({
      documento: doc.id,
      socioId: dados.socioId,
      socioNome: dados.socioNome,
      nome:
        dados.nome ||
        dados.clienteNome ||
        dados.produtoNome ||
        "",
    });
  });
}

async function executar() {
  console.clear();

  for (const colecao of colecoes) {
    await diagnosticarColecao(colecao);
  }

  console.log("\n=========== FIM ===========");
}

executar();