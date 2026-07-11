import Layout from "../../../components/layout/Layout";

import DespesaForm from "../../../components/despesas/DespesaForm";

export default function NovaDespesaPage() {

  return (

    <Layout>

      <div className="space-y-8">

        <div>

          <h1 className="text-4xl font-bold text-white">

            Nova Despesa

          </h1>

          <p className="text-zinc-400 mt-2">

            Cadastre uma nova despesa.

          </p>

        </div>

        <DespesaForm />

      </div>

    </Layout>

  );

}