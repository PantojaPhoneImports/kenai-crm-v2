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
import { calcularFinanceiroSocio } from "@/services/calculosFinanceiros";

const repassesRef = collection(
  db,
  "repasses"
);

// criar repasse da venda
export async function criarRepasse(
  dados: any
) {
  const quantidadeParcelas = Math.max(Number(dados.parcelas || 1), 1);
  const calculo = calcularFinanceiroSocio({
    tipoSocio: dados.tipoSocio,
    capitalInvestido: Number(dados.capitalInvestido || 0),
    entrada: Number(dados.entrada || 0),
    lucroTotal: Number(dados.lucroTotal || 0),
    parcelas: quantidadeParcelas,
  });

  const ref = await addDoc(
    repassesRef,
    {
      ...dados,
      tipoSocio: calculo.tipoSocio,
      parcelas: quantidadeParcelas,
      capitalRecuperado: calculo.capitalRecuperadoEntrada,
      capitalRestante: calculo.capitalRestante,
      capitalPorParcela: calculo.capitalPorParcela,
      lucroSocioPorParcela: calculo.lucroSocioPorParcela,
      lucroEmpresaPorParcela: calculo.lucroEmpresaPorParcela,
      socioRecebido: calculo.capitalRecuperadoEntrada,
      empresaRecebido: 0,
      totalSocioReceber: calculo.capitalRestante + calculo.lucroSocioTotal,
      totalEmpresaReceber: calculo.lucroEmpresaTotal,
      valorReceber:
        calculo.socioPorParcela * quantidadeParcelas +
        calculo.empresaPorParcela * quantidadeParcelas,
    }
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
