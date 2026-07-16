import Layout from "@/components/layout/Layout";
import SocioForm from "@/components/socios/SocioForm";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({
  params,
}: Props) {

  const { id } = await params;

  return (

    <Layout>

      <div className="space-y-8">

        <div>

          <h1 className="text-4xl font-bold text-white">

            Editar Sócio

          </h1>

          <p className="text-zinc-400 mt-2">

            Atualize os dados do sócio.

          </p>

        </div>

        <SocioForm id={id} />

      </div>

    </Layout>

  );

}