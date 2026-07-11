import Layout from "@/components/layout/Layout";
import ConfiguracoesForm from "@/components/configuracoes/ConfiguracoesForm";

export default function ConfiguracoesPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Configurações
          </h1>

          <p className="text-zinc-400 mt-2">
            Configure os dados da empresa.
          </p>
        </div>

        <ConfiguracoesForm />
      </div>
    </Layout>
  );
}