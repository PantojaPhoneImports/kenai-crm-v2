import Layout from "@/components/layout/Layout";
import PerfilSocio from "@/components/socios/PerfilSocio";

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
      <PerfilSocio id={id} />
    </Layout>
  );

}