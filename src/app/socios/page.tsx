import Layout from "@/components/layout/Layout";

import SociosTable from "@/components/socios/SociosTable";

export default function SociosPage() {
  return (
    <Layout>
      <div className="space-y-8">

        <div>

          <h1 className="text-4xl font-bold text-white">
            Sócios
          </h1>

          <p className="text-zinc-400 mt-2">
            Gerencie todos os sócios da empresa.
          </p>

        </div>

        <SociosTable />

      </div>
    </Layout>
  );
}