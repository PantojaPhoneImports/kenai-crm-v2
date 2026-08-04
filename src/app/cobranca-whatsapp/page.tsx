import Layout from "@/components/layout/Layout";
import CentralWhatsapp from "@/components/cobranca/CentralWhatsapp";
import CobrancaPageHeader from "@/components/cobranca/CobrancaPageHeader";

export default function CobrancaWhatsappPage() {
  return <Layout><div className="space-y-8"><CobrancaPageHeader /><CentralWhatsapp /></div></Layout>;
}
