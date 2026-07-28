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
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  buscarRepasseVenda,
  atualizarRepasse,
} from "@/services/repasses";


const parcelasRef = collection(
  db,
  "parcelas"
);


export async function criarParcela(
  parcela: any
) {

  await addDoc(
    parcelasRef,
    parcela
  );

}


export async function listarParcelas() {

  const q = query(
    parcelasRef,
    orderBy(
      "vencimento",
      "asc"
    )
  );


  const snapshot =
    await getDocs(q);


  return snapshot.docs.map(
    (docItem) => ({

      id: docItem.id,

      ...docItem.data(),

    })
  );

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
  dataPagamento:string,
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

      dataPagamento,

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



  const valorParcela =
    Number(
      parcela.valor || 0
    );



  const capitalParcela =
  Number(repasse.capitalPorParcela || 0);

const lucroSocioParcela =
  Number(repasse.lucroSocioPorParcela || 0);

const lucroEmpresaParcela =
  Number(repasse.lucroEmpresaPorParcela || 0);

const parteSocio =
  capitalParcela +
  lucroSocioParcela;

const parteEmpresa =
  lucroEmpresaParcela;



  const novoCapitalRecuperado =
  Number(repasse.capitalRecuperado || 0) +
  capitalParcela;

const novoCapitalRestante =
  Math.max(
    Number(repasse.capitalRestante || 0) -
    capitalParcela,
    0
  );

const novoSocioRecebido =
  Number(repasse.socioRecebido || 0) +
  parteSocio;

const novaEmpresaRecebido =
  Number(repasse.empresaRecebido || 0) +
  parteEmpresa;

const novoValorReceber =
  Math.max(
    Number(repasse.valorReceber || 0) -
    valorParcela,
    0
  );

await atualizarRepasse(repasse.id, {

  socioRecebido: novoSocioRecebido,

  empresaRecebido: novaEmpresaRecebido,

  capitalRecuperado: novoCapitalRecuperado,

  capitalRestante: novoCapitalRestante,

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