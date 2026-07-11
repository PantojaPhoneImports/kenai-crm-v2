import Layout from "../../../components/layout/Layout";

import DespesaForm from "../../../components/despesas/DespesaForm";

import { buscarDespesa } from "../../../services/despesas";

export default async function Page({

  params,

}: {

  params: Promise<{ id: string }>;

}) {

  const { id } = await params;

  const despesa = await buscarDespesa(id);

  return (

    <Layout>

      <div className="space-y-8">

        <div>

          <h1 className="text-4xl font-bold text-white">

            Editar Despesa

          </h1>

          <p className="text-zinc-400 mt-2">

            Atualize as informações da despesa.

          </p>

        </div>

        <DespesaForm despesa={despesa} />

      </div>

    </Layout>

  );

}