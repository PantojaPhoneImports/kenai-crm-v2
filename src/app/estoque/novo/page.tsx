import Layout from "@/components/layout/Layout";
import EstoqueForm from "@/components/estoque/EstoqueForm";

export default function NovoProdutoPage() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">

        <div>
          <h1 className="text-4xl font-bold text-white">
            Novo Produto
          </h1>

          <p className="text-zinc-400 mt-2">
            Cadastre um novo produto.
          </p>
        </div>

        <EstoqueForm />

      </div>
    </Layout>
  );
}