import Link from "next/link";

import Layout from "@/components/layout/Layout";
import ClienteTable from "@/components/clientes/ClienteTable";
import { Button } from "@/components/ui/button";

export default function ClientesPage() {
  return (
    <Layout>
      <div className="space-y-8">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-4xl font-bold text-white">
              Clientes
            </h1>

            <p className="text-zinc-400 mt-2">
              Gerencie todos os seus clientes.
            </p>
          </div>

          <Link href="/clientes/novo">
            <Button>
              Novo Cliente
            </Button>
          </Link>

        </div>

        <ClienteTable />

      </div>
    </Layout>
  );
}