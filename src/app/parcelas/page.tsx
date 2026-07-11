import Layout from "@/components/layout/Layout";

import ParcelasTable from "@/components/parcelas/ParcelasTable";

export default function ParcelasPage() {

  return (

    <Layout>

      <div className="space-y-8">

        <div>

          <h1 className="text-4xl font-bold text-white">

            Parcelas

          </h1>

          <p className="text-zinc-400 mt-2">

            Gerencie todas as parcelas dos seus clientes.

          </p>

        </div>

        <ParcelasTable />
                </div>

    </Layout>

  );

}