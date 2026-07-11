"use client";

import { useEffect, useState } from "react";

import { listarProdutos } from "@/services/estoque";

export function useEstoque() {
  const [produtos, setProdutos] = useState<any[]>([]);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const dados = await listarProdutos();

    setProdutos(dados);
  }

  return {
    produtos,
    atualizar: carregar,
  };
}