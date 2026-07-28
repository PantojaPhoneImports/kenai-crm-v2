import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export async function carregarDashboard(usuario?: any) {

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

    let listaClientes = clientes.docs.map((d) => d.data());

    let listaEstoque = estoque.docs.map((d) => d.data());

    let listaVendas = vendas.docs.map((d) => d.data());

    let listaParcelas = parcelas.docs.map((d) => d.data());

    console.log("==================================");
    console.log("USUARIO:", usuario);
    console.log("SOCIO ID:", usuario?.socioId);

    console.log("ANTES DO FILTRO");
    console.log("Clientes:", listaClientes.length);
    console.log("Estoque:", listaEstoque.length);
    console.log("Vendas:", listaVendas.length);
    console.log("Parcelas:", listaParcelas.length);

    if (usuario?.perfil === "SOCIO") {

      listaClientes = listaClientes.filter(
        (item: any) => item.socioId === usuario.socioId
      );

      listaEstoque = listaEstoque.filter(
        (item: any) => item.socioId === usuario.socioId
      );

      listaVendas = listaVendas.filter(
        (item: any) => item.socioId === usuario.socioId
      );

      listaParcelas = listaParcelas.filter(
        (item: any) => item.socioId === usuario.socioId
      );

    }

    console.log("DEPOIS DO FILTRO");
    console.log("Clientes:", listaClientes.length);
    console.log("Estoque:", listaEstoque.length);
    console.log("Vendas:", listaVendas.length);
    console.log("Parcelas:", listaParcelas.length);
    console.log("==================================");

    const valorInvestido = listaEstoque.reduce(
      (total: number, produto: any) =>
        total + Number(produto.custo || 0),
      0
    );

    const valorEstoque = listaEstoque.reduce(
      (total: number, produto: any) =>
        total + Number(produto.venda || 0),
      0
    );

    const faturamento = listaVendas.reduce(
      (total: number, venda: any) =>
        total + Number(venda.valorProduto || 0),
      0
    );

    const parcelasPendentes = listaParcelas.filter(
      (p: any) => p.status === "PENDENTE"
    ).length;

    return {

      clientes: listaClientes.length,
      estoque: listaEstoque.length,
      vendas: listaVendas.length,

      socios: usuario?.perfil === "SOCIO"
        ? 0
        : socios.size,

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