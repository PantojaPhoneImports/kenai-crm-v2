import Layout from "../../components/layout/Layout";

import DespesaDashboard from "../../components/despesas/DespesaDashboard";

export default function DespesasPage() {

  return (

    <Layout>

      <div className="space-y-8">

        <div>

          <h1 className="text-4xl font-bold text-white">

            Despesas

          </h1>

          <p className="text-zinc-400 mt-2">

            Controle de todas as despesas da empresa.

          </p>

        </div>

        <DespesaDashboard />

      </div>

    </Layout>

  );

}