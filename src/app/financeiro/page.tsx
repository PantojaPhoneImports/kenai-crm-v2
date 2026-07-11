import Layout from "@/components/layout/Layout";

import FinanceiroDashboard from "../../components/financeiro/FinanceiroDashboard";

export default function FinanceiroPage() {

  return (

    <Layout>

      <div className="space-y-8">

        <div>

          <h1 className="text-4xl font-bold text-white">

            Financeiro

          </h1>

          <p className="text-zinc-400 mt-2">

            Controle financeiro completo da empresa.

          </p>

        </div>

        <FinanceiroDashboard />
              </div>

    </Layout>

  );

}