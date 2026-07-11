import Layout from "@/components/layout/Layout";

import ReceberParcela from "@/components/parcelas/ReceberParcela";

import { listarParcelas } from "@/services/parcelas";

interface Props {

  params: Promise<{

    id: string;

  }>;

}

export default async function Page({

  params,

}: Props) {

  const { id } = await params;

  const parcelas = await listarParcelas();

  const parcela = parcelas.find(

    (item: any) => item.id === id

  );

  if (!parcela) {

    return (

      <Layout>

        <div className="text-white text-2xl">

          Parcela não encontrada.

        </div>

      </Layout>

    );

  }

  return (

    <Layout>

      <ReceberParcela

        parcela={parcela}

      />

    </Layout>

  );

}