import Link from "next/link";
import Layout from "@/components/layout/Layout";
import CentralWhatsapp from "@/components/cobranca/CentralWhatsapp";
import { Button } from "@/components/ui/button";

export default function CobrancaWhatsappPage() {
  return <Layout><div className="space-y-8"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h1 className="text-3xl font-bold text-white sm:text-4xl">Cobrança WhatsApp</h1><p className="mt-2 text-zinc-400">Acompanhe vencimentos e envie lembretes aos clientes.</p></div><div className="flex gap-2"><Button variant="outline" render={<Link href="/cobranca-whatsapp/logs" />}>Logs</Button><Button variant="outline" render={<Link href="/cobranca-whatsapp/configuracoes" />}>Configurações</Button></div></div><CentralWhatsapp /></div></Layout>;
}
