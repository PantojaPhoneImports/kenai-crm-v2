import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export async function carregarDashboard() {

  try {

    const clientes = await getDocs(
      collection(db, "clientes")
    );

    const estoque = await getDocs(
      collection(db, "estoque")
    );

    const vendas = await getDocs(
      collection(db, "vendas")
    );

    const parcelas = await getDocs(
      collection(db, "parcelas")
    );

    const socios = await getDocs(
      collection(db, "socios")
    );

    console.log("Clientes:", clientes.size);
    console.log("Estoque:", estoque.size);
    console.log("Vendas:", vendas.size);
    console.log("Parcelas:", parcelas.size);
    console.log("Sócios:", socios.size);

    const produtos = estoque.docs.map((d) => d.data());

    const valorInvestido = produtos.reduce(
      (total: number, produto: any) =>
        total + Number(produto.custo || 0),
      0
    );

    const valorEstoque = produtos.reduce(
      (total: number, produto: any) =>
        total + Number(produto.venda || 0),
      0
    );

    const faturamento = vendas.docs.reduce(
      (total: number, venda: any) =>
        total + Number(venda.data().valorProduto || 0),
      0
    );

    const parcelasPendentes = parcelas.docs.filter(
      (p) => p.data().status === "PENDENTE"
    ).length;

    return {
      clientes: clientes.size,
      estoque: estoque.size,
      vendas: vendas.size,
      socios: socios.size,
      parcelasPendentes,
      valorInvestido,
      valorEstoque,
      faturamento,
    };

  } catch (erro) {

    console.error("ERRO DASHBOARD:", erro);

    return {
      clientes: 0,
      estoque: 0,
      vendas: 0,
      socios: 0,
      parcelasPendentes: 0,
      valorInvestido: 0,
      valorEstoque: 0,
      faturamento: 0,
    };

  }

}