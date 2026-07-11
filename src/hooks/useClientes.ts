"use client";

import { useEffect, useState } from "react";
import { listarClientes } from "@/services/clientes";

export function useClientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregarClientes() {
    setLoading(true);

    const dados = await listarClientes();

    setClientes(dados);

    setLoading(false);
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  return {
    clientes,
    loading,
    atualizar: carregarClientes,
  };
}