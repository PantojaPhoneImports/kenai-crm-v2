import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { filtrarPorSocio, possuiSocioId, usuarioEhSocio, type UsuarioAutenticado } from "@/lib/socio";

async function consultarColecao(nome: string, socioId?: string) {
  const inicio = performance.now();
  console.info("[dashboard] início da consulta", { colecao: nome });

  try {
    const referencia = collection(db, nome);
    const resultado = await getDocs(socioId ? query(referencia, where("socioId", "==", socioId)) : referencia);
    console.info("[dashboard] resultado da consulta", {
      colecao: nome,
      documentos: resultado.size,
      tempoMs: Math.round(performance.now() - inicio),
    });
    return resultado;
  } catch (error) {
    const erro = error as { code?: string; message?: string; stack?: string };
    console.error("[dashboard] erro na consulta", {
      colecao: nome,
      tempoMs: Math.round(performance.now() - inicio),
      code: erro.code,
      message: erro.message,
      stack: erro.stack,
      error,
    });
    throw error;
  }
}

export async function carregarDashboard(usuario?: UsuarioAutenticado | null) {
  const inicio = performance.now();
  console.info("[dashboard] Dashboard iniciado", {
    usuario: usuario?.email ?? null,
    perfil: usuario?.perfil ?? null,
    socioId: usuario?.socioId ?? null,
  });

  try {
    const socioId = usuarioEhSocio(usuario) && possuiSocioId(usuario?.socioId)
      ? usuario.socioId
      : undefined;
    const [clientes, estoque, vendas, parcelas, socios] = await Promise.all([
      consultarColecao("clientes", socioId),
      consultarColecao("estoque", socioId),
      consultarColecao("vendas", socioId),
      consultarColecao("parcelas", socioId),
      usuarioEhSocio(usuario) ? Promise.resolve(null) : consultarColecao("socios"),
    ]);

    let listaClientes = clientes.docs.map((d) => ({ id: d.id, ...d.data() }));
    let listaEstoque = estoque.docs.map((d) => ({ id: d.id, ...d.data() }));
    let listaVendas = vendas.docs.map((d) => ({ id: d.id, ...d.data() }));
    let listaParcelas = parcelas.docs.map((d) => ({ id: d.id, ...d.data() }));

    listaClientes = filtrarPorSocio(listaClientes, usuario);
    listaEstoque = filtrarPorSocio(listaEstoque, usuario);
    listaVendas = filtrarPorSocio(listaVendas, usuario);
    listaParcelas = filtrarPorSocio(listaParcelas, usuario);

    const resultado = {
      clientes: listaClientes.length,
      estoque: listaEstoque.length,
      vendas: listaVendas.length,
      socios: usuarioEhSocio(usuario) ? 0 : socios?.size ?? 0,
      parcelasPendentes: listaParcelas.filter((p: any) => p.status === "PENDENTE").length,
      valorInvestido: listaEstoque.reduce((total: number, produto: any) => total + Number(produto.custo || 0), 0),
      valorEstoque: listaEstoque.reduce((total: number, produto: any) => total + Number(produto.venda || 0), 0),
      faturamento: listaVendas.reduce((total: number, venda: any) => total + Number(venda.valorProduto || 0), 0),
      lucro: listaVendas.reduce((total: number, venda: any) => total + (Number(venda.valorProduto || 0) - Number(venda.custoProduto || 0)), 0),
    };

    console.info("[dashboard] Dashboard concluído", { ...resultado, tempoMs: Math.round(performance.now() - inicio) });
    return resultado;
  } catch (error) {
    const erro = error as { code?: string; message?: string; stack?: string };
    console.error("[dashboard] falha ao carregar Dashboard", {
      tempoMs: Math.round(performance.now() - inicio),
      code: erro.code,
      message: erro.message,
      stack: erro.stack,
      error,
    });
    throw error;
  }
}
