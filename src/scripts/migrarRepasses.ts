import { getDocs, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function migrarRepasses() {

  const snapshot = await getDocs(
    collection(db, "repasses")
  );

  for (const item of snapshot.docs) {

    const repasse = item.data();

    const lucroTotal =
      Number(repasse.lucroTotal || 0);

    const percentual =
      Number(repasse.percentualLucro || 100);

    const lucroSocio =
      lucroTotal * percentual / 100;

    const lucroEmpresa =
      lucroTotal - lucroSocio;

    const capital =
      Number(repasse.capitalInvestido || 0);

    const recuperado =
      Number(repasse.capitalRecuperado || 0);

    const restante =
      Math.max(
        capital - recuperado,
        0
      );

    await updateDoc(

      doc(
        db,
        "repasses",
        item.id
      ),

      {

        percentualLucro: percentual,

        lucroSocioTotal: lucroSocio,

        lucroEmpresaTotal: lucroEmpresa,

        totalSocioReceber:
          capital + lucroSocio,

        totalEmpresaReceber:
          Number(repasse.capitalEmpresa || 0)
          + lucroEmpresa,

        capitalRestante: restante,

      }

    );

    console.log(
      "Repasse atualizado:",
      item.id
    );

  }

  console.log("Migração concluída.");

}