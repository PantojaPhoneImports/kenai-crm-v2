import Layout from "@/components/layout/Layout";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import EstoqueTable from "@/components/estoque/EstoqueTable";

export default function EstoquePage() {
  return (
    <Layout>
      <div className="space-y-8">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-4xl font-bold text-white">
              Estoque
            </h1>

            <p className="text-zinc-400 mt-2">
              Gerencie todos os aparelhos cadastrados.
            </p>
          </div>

          <Link href="/estoque/novo">
            <Button>
              Novo Produto
            </Button>
          </Link>

        </div>

        <EstoqueTable />

      </div>
    </Layout>
  );
}