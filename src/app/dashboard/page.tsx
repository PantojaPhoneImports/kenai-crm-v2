import Layout from "@/components/layout/Layout";

import DashboardCards from "@/components/dashboard/DashboardCards";
import DashboardChart from "@/components/dashboard/DashboardChart";

import UltimasVendas from "../../components/dashboard/UltimasVendas";
import ProximosVencimentos from "../../components/dashboard/ProximosVencimentos";

export default function DashboardPage() {

  return (

    <Layout>

      <div className="space-y-8">

        <div>

          <h1 className="text-4xl font-bold text-white">

            Dashboard

          </h1>

          <p className="text-zinc-400 mt-2">

            Bem-vindo ao Kenai CRM

          </p>

        </div>

        <DashboardCards />

        <DashboardChart />        <div className="grid grid-cols-2 gap-8">

          <UltimasVendas />

          <ProximosVencimentos />

        </div>

      </div>

    </Layout>

  );

}