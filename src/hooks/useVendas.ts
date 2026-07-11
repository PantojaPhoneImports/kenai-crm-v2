"use client";

import { useEffect, useState } from "react";

import { listarVendas } from "@/services/vendas";

export function useVendas() {
  const [vendas, setVendas] = useState<any[]>([]);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const dados = await listarVendas();
    setVendas(dados);
  }

  return {
    vendas,
    atualizar: carregar,
  };
}