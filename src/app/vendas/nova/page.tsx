import Layout from "@/components/layout/Layout";
import VendaForm from "@/components/vendas/VendaForm";

export default function NovaVendaPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">

        <div>
          <h1 className="text-4xl font-bold text-white">
            Nova Venda
          </h1>

          <p className="text-zinc-400 mt-2">
            Selecione o cliente e o aparelho.
          </p>
        </div>

        <VendaForm />

      </div>
    </Layout>
  );
}