import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { filtrarPorSocio, type UsuarioAutenticado } from "@/lib/socio";

export async function carregarDashboard(usuario?: UsuarioAutenticado | null) {

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

    let listaClientes = clientes.docs.map((d) => ({
  id: d.id,
  ...d.data(),
}));

console.table(listaClientes);

let listaEstoque = estoque.docs.map((d) => ({
  id: d.id,
  ...d.data(),
}));

let listaVendas = vendas.docs.map((d) => ({
  id: d.id,
  ...d.data(),
}));

let listaParcelas = parcelas.docs.map((d) => ({
  id: d.id,
  ...d.data(),
}));

    listaClientes = filtrarPorSocio(listaClientes, usuario);
    listaEstoque = filtrarPorSocio(listaEstoque, usuario);
    listaVendas = filtrarPorSocio(listaVendas, usuario);
    listaParcelas = filtrarPorSocio(listaParcelas, usuario);

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
