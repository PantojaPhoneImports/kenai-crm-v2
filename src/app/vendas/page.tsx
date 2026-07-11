import Layout from "@/components/layout/Layout";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import VendasTable from "../../components/vendas/VendasTable";

export default function VendasPage() {
  return (
    <Layout>

      <div className="space-y-8">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-bold text-white">
              Vendas
            </h1>

            <p className="text-zinc-400 mt-2">
              Gerencie todas as vendas realizadas.
            </p>

          </div>

          <Link href="/vendas/nova">
            <Button>
              Nova Venda
            </Button>
          </Link>

        </div>

        <VendasTable />

      </div>

    </Layout>
  );
}