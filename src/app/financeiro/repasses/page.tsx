import Layout from "@/components/layout/Layout";
import RepassesTable from "@/components/financeiro/RepassesTable";

export default function RepassesPage() {
  return (
    <Layout>

      <div className="space-y-8">

        <div>

          <h1 className="text-4xl font-bold text-white">
            Repasses
          </h1>

          <p className="text-zinc-400 mt-2">
            Controle dos repasses aos sócios.
          </p>

        </div>

        <RepassesTable />

      </div>

    </Layout>
  );
}