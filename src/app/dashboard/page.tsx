import Layout from "@/components/layout/Layout";

import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardDiagnostics from "@/components/dashboard/DashboardDiagnostics";

export default function DashboardPage() {

  return (

    <Layout>

      <DashboardDiagnostics />

      <div className="space-y-8">

        <div>

          <h1 className="text-4xl font-bold text-white">

            Dashboard

          </h1>

          <p className="text-zinc-400 mt-2">

            Bem-vindo ao Kenai CRM

          </p>

        </div>

        <DashboardContent />

      </div>

    </Layout>

  );

}
