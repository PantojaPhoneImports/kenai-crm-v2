import Layout from "@/components/layout/Layout";

import FluxoCaixaDashboard from "../../components/caixa/FluxoCaixaDashboard";

export default function CaixaPage() {

  return (

    <Layout>

      <div className="space-y-8">

        <div>

          <h1 className="text-4xl font-bold text-white">

            Fluxo de Caixa

          </h1>

          <p className="text-zinc-400 mt-2">

            Controle de entradas, saídas e saldo da empresa.

          </p>

        </div>

        <FluxoCaixaDashboard />
              </div>

    </Layout>

  );

}