"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usuarioEhSocio } from "@/lib/socio";
import { Button } from "@/components/ui/button";

export default function CobrancaPageHeader() {
  const { usuario } = useAuth();
  const ehSocio = usuarioEhSocio(usuario);
  return <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h1 className="text-3xl font-bold text-white sm:text-4xl">Cobrança WhatsApp</h1><p className="mt-2 text-zinc-400">{ehSocio ? "Acompanhe os vencimentos e lembretes dos seus clientes." : "Acompanhe vencimentos e envie lembretes aos clientes."}</p></div>{!ehSocio && <div className="flex gap-2"><Button variant="outline" render={<Link href="/cobranca-whatsapp/logs" />}>Logs</Button><Button variant="outline" render={<Link href="/cobranca-whatsapp/configuracoes" />}>Configurações</Button></div>}</div>;
}
