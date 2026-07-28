import Layout from "@/components/layout/Layout";
import EditarParcelaForm from "@/components/parcelas/EditarParcelaForm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Layout>
      <EditarParcelaForm id={id} />
    </Layout>
  );
}