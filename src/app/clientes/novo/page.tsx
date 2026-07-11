import Layout from "@/components/layout/Layout";
import ClienteForm from "@/components/clientes/ClienteForm";

export default function NovoClientePage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">

        <div>
          <h1 className="text-4xl font-bold text-white">
            Novo Cliente
          </h1>

          <p className="text-zinc-400 mt-2">
            Cadastre um novo cliente.
          </p>
        </div>

        <ClienteForm />

      </div>
    </Layout>
  );
}