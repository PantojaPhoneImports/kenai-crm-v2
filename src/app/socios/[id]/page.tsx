import Layout from "@/components/layout/Layout";
import PerfilSocio from "@/components/socios/PerfilSocio";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PerfilSocioPage({
  params,
}: Props) {
  const { id } = await params;

  return (
    <Layout>
      <PerfilSocio id={id} />
    </Layout>
  );
}