"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Layout from "@/components/layout/Layout";
import ReceberParcela from "@/components/parcelas/ReceberParcela";
import { buscarParcela } from "@/services/parcelas";

/** A parcela é lida no navegador autenticado. Server Components não carregam
 * dados protegidos pelo Firestore porque não possuem a sessão Firebase do usuário. */
export default function Page() {
  const params = useParams<{ id: string }>();
  const [parcela, setParcela] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    buscarParcela(params.id)
      .then((resultado) => {
        if (!resultado) setErro("Parcela não encontrada.");
        else setParcela(resultado);
      })
      .catch((causa) => {
        console.error("Erro ao carregar parcela para recebimento:", causa);
        setErro("Não foi possível carregar esta parcela. Verifique sua permissão e tente novamente.");
      });
  }, [params.id]);

  return <Layout>
    {erro ? <div className="text-white text-2xl">{erro}</div> : !parcela ? <div className="text-zinc-400">Carregando parcela...</div> : <ReceberParcela parcela={parcela} />}
  </Layout>;
}
