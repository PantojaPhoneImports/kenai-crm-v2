import Layout from "@/components/layout/Layout";

import DashboardCards from "@/components/dashboard/DashboardCards";
import DashboardChart from "@/components/dashboard/DashboardChart";

import UltimasVendas from "@/components/dashboard/UltimasVendas";
import ProximosVencimentos from "@/components/dashboard/ProximosVencimentos";
import DashboardDiagnostics from "@/components/dashboard/DashboardDiagnostics";
import DiagnosticErrorBoundary from "@/components/common/DiagnosticErrorBoundary";

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

        <DiagnosticErrorBoundary nome="DashboardCards"><DashboardCards /></DiagnosticErrorBoundary>

        <DiagnosticErrorBoundary nome="DashboardChart"><DashboardChart /></DiagnosticErrorBoundary>
        <div className="grid grid-cols-2 gap-8">

          <DiagnosticErrorBoundary nome="UltimasVendas"><UltimasVendas /></DiagnosticErrorBoundary>

          <DiagnosticErrorBoundary nome="ProximosVencimentos"><ProximosVencimentos /></DiagnosticErrorBoundary>

        </div>

      </div>

    </Layout>

  );

}
