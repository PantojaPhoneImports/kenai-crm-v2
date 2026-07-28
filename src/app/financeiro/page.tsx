import Layout from "@/components/layout/Layout";
import LucroPorProduto from "@/components/financeiro/LucroPorProduto";
import FinanceiroDashboard from "@/components/financeiro/FinanceiroDashboard";
import FinanceiroTable from "@/components/financeiro/FinanceiroTable";

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

        <FinanceiroTable />
<LucroPorProduto />
      </div>
    </Layout>
  );
}