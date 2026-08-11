import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Parcela } from "@/types/parcela";

import {
  buscarRepasseVenda,
  atualizarRepasse,
} from "@/services/repasses";
import { calcularFinanceiroPago } from "@/services/calculosFinanceiros";
import { buscarVendaPorId } from "@/services/vendas";


const parcelasRef = collection(
  db,
  "parcelas"
);


export async function criarParcela(
  parcela: Omit<Parcela, "id">
) {

  await addDoc(
    parcelasRef,
    { ...parcela, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }
  );

}


export async function listarParcelas(socioId?: string): Promise<Parcela[]> {

  const q = socioId
    ? query(parcelasRef, where("socioId", "==", socioId))
    : query(parcelasRef, orderBy("vencimento", "asc"));


  const snapshot =
    await getDocs(q);


  const parcelas = snapshot.docs.map(
    (docItem) => ({

      id: docItem.id,

      ...(docItem.data() as Omit<Parcela, "id">),

    })
  );

  return socioId
    ? parcelas.sort((a: any, b: any) => Number(a.vencimento?.seconds || new Date(a.vencimento).getTime()) - Number(b.vencimento?.seconds || new Date(b.vencimento).getTime()))
    : parcelas;

}



export async function buscarParcela(
  id:string
) {

  const snapshot =
    await getDoc(
      doc(
        db,
        "parcelas",
        id
      )
    );


  if(!snapshot.exists())
    return null;


  return {
  id: snapshot.id,
  ...(snapshot.data() as any),
};

}



export async function atualizarParcela(
  id:string,
  dados:any
){

  await updateDoc(

    doc(
      db,
      "parcelas",
      id
    ),

    dados

  );

}



export async function receberParcela(
  id:string,
  formaPagamento:string,
  _dataPagamento:string,
  observacao:string
){

  const parcela =
    await buscarParcela(id);


  if(!parcela)
    return;



  // marca parcela como paga

  await updateDoc(

    doc(
      db,
      "parcelas",
      id
    ),

    {

      status:"PAGA",

      formaPagamento,

      dataPagamento: serverTimestamp(),

      updatedAt: serverTimestamp(),

      observacao,

    }

  );



  if(!parcela.vendaId)
    return;



  const repasse =
    await buscarRepasseVenda(
      parcela.vendaId
    );


  if(!repasse)
    return;

  const venda = await buscarVendaPorId(parcela.vendaId);


  const quantidadeParcelas = Math.max(Number(repasse.parcelas || 1), 1);
  const entrada = Number(repasse.entrada || 0);
  const capitalPorParcela = Number(repasse.capitalPorParcela || 0);
  const parcelasPagasAntes = capitalPorParcela > 0
    ? Math.round((Number(repasse.capitalRecuperado || 0) - entrada) / capitalPorParcela)
    : 0;
  const calculo = calcularFinanceiroPago({
    tipoSocio: repasse.tipoSocio,
    capitalInvestido: Number(repasse.capitalInvestido || 0),
    entrada,
    lucroTotal: Number(repasse.lucroTotal || 0),
    custoProduto: Number(repasse.custoProduto || venda?.custoProduto || 0),
    parcelas: quantidadeParcelas,
  }, parcelasPagasAntes + 1);

  const novoValorReceber = Math.max(
    calculo.socioReceber + calculo.empresaReceber,
    0
  );

await atualizarRepasse(repasse.id, {

  socioRecebido: calculo.socioRecebido,

  empresaRecebido: calculo.empresaRecebido,

  capitalRecuperado: calculo.capitalRecuperado,

  capitalRestante: calculo.capitalRestante,

  valorReceber: novoValorReceber,

  status:
    novoValorReceber <= 0
      ? "FINALIZADO"
      : "ATIVO",

});

}
export async function excluirParcela(
  id: string
) {
  await deleteDoc(
    doc(
      db,
      "parcelas",
      id
    )
  );
}
