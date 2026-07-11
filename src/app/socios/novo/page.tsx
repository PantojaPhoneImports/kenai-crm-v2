import Layout from "@/components/layout/Layout";
import SocioForm from "@/components/socios/SocioForm";

export default function NovoSocioPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Novo Sócio
          </h1>

          <p className="text-zinc-400 mt-2">
            Cadastre um novo sócio da empresa.
          </p>
        </div>

        <SocioForm />

      </div>
    </Layout>
  );
}