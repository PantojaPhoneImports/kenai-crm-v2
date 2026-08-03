import Layout from "@/components/layout/Layout";
import CentralWhatsapp from "@/components/cobranca/CentralWhatsapp";

export default function CobrancaWhatsappPage() {
  return <Layout><div className="space-y-8"><div><h1 className="text-3xl font-bold text-white sm:text-4xl">Cobrança WhatsApp</h1><p className="mt-2 text-zinc-400">Acompanhe vencimentos e envie lembretes aos clientes.</p></div><CentralWhatsapp /></div></Layout>;
}
