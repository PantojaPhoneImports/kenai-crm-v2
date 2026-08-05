"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { AlertTriangle, CheckCircle2, Users, Wallet } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { usuarioEhSocio } from "@/lib/socio";
import { excluirParcela } from "@/services/parcelas";
import ClienteCard from "./ClienteCard";
import CentralCobrancas, { type ClienteCobranca } from "./CentralCobrancas";
import ParcelasFiltro from "./ParcelasFiltro";

type FiltroCobranca = "ATRASADO" | "HOJE" | "3DIAS" | null;

function inicioDia(data: Date) { const copia = new Date(data); copia.setHours(0, 0, 0, 0); return copia; }
function dataParcela(parcela: any) { return inicioDia(parcela.vencimento?.seconds ? new Date(parcela.vencimento.seconds * 1000) : new Date(parcela.vencimento)); }
function categoriaCobranca(parcela: any, hoje: Date): Exclude<FiltroCobranca, null> | null {
  if (parcela.status === "PAGA") return null;
  const dias = Math.ceil((dataParcela(parcela).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (dias < 0) return "ATRASADO";
  if (dias === 0) return "HOJE";
  return dias <= 3 ? "3DIAS" : null;
}
function moeda(valor: number) { return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

export default function ParcelasTable() {
  const { usuario } = useAuth();
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroCobranca, setFiltroCobranca] = useState<FiltroCobranca>(null);

  useEffect(() => {
    if (!usuario) { setParcelas([]); return; }
    const consulta = usuarioEhSocio(usuario)
      ? query(collection(db, "parcelas"), where("socioId", "==", usuario.socioId))
      : query(collection(db, "parcelas"), orderBy("vencimento", "asc"));
    return onSnapshot(consulta, (snapshot) => {
      const dados = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      dados.sort((a: any, b: any) => (a.clienteNome || "").localeCompare(b.clienteNome || "") || (a.produtoNome || "").localeCompare(b.produtoNome || "") || Number(a.parcela) - Number(b.parcela));
      setParcelas(dados);
    }, (erro) => console.error("Erro ao atualizar parcelas:", erro));
  }, [usuario]);

  async function apagar(id: string) {
    if (!confirm("Deseja excluir esta parcela?")) return;
    await excluirParcela(id);
  }

  const dados = useMemo(() => {
    const hoje = inicioDia(new Date());
    const mapa = new Map<string, { id: string; cliente: string; telefone: string; parcelas: any[] }>();
    const cobrancas: Record<Exclude<FiltroCobranca, null>, Map<string, ClienteCobranca>> = { ATRASADO: new Map(), HOJE: new Map(), "3DIAS": new Map() };
    let valorPendente = 0;

    parcelas.forEach((parcela) => {
      const idCliente = String(parcela.clienteId || parcela.clienteNome || parcela.id);
      const grupo = mapa.get(idCliente) || { id: idCliente, cliente: parcela.clienteNome || "Cliente", telefone: parcela.clienteTelefone || parcela.telefone || "", parcelas: [] as any[] };
      grupo.parcelas.push(parcela); mapa.set(idCliente, grupo);
      if (parcela.status !== "PAGA") valorPendente += Number(parcela.valor || 0);
      const categoria = categoriaCobranca(parcela, hoje);
      if (categoria) {
        const atual = cobrancas[categoria].get(idCliente) || { id: idCliente, nome: grupo.cliente, valor: 0 };
        atual.valor += Number(parcela.valor || 0); cobrancas[categoria].set(idCliente, atual);
      }
    });

    const clientes = [...mapa.values()];
    const ativos = clientes.filter((cliente) => cliente.parcelas.some((parcela) => parcela.status !== "PAGA")).length;
    const quitados = clientes.filter((cliente) => cliente.parcelas.length > 0 && cliente.parcelas.every((parcela) => parcela.status === "PAGA")).length;
    const atrasados = clientes.filter((cliente) => cliente.parcelas.some((parcela) => categoriaCobranca(parcela, hoje) === "ATRASADO")).length;
    const texto = busca.trim().toLowerCase();
    const visiveis = clientes.filter((cliente) => {
      if (filtroCobranca && !cliente.parcelas.some((parcela) => categoriaCobranca(parcela, hoje) === filtroCobranca)) return false;
      if (!texto) return true;
      return cliente.parcelas.some((parcela) => [cliente.cliente, cliente.telefone, parcela.clienteTelefone, parcela.telefone, parcela.produtoNome, parcela.modelo, parcela.produtoModelo, parcela.imei, parcela.cor]
        .filter(Boolean).join(" ").toLowerCase().includes(texto));
    });
    return { visiveis, ativos, quitados, atrasados, valorPendente, cobrancas: { atrasadas: [...cobrancas.ATRASADO.values()], hoje: [...cobrancas.HOJE.values()], tresDias: [...cobrancas["3DIAS"].values()] } };
  }, [parcelas, busca, filtroCobranca]);

  const resumo = [
    ["Clientes ativos", dados.ativos, Users, "text-cyan-400"],
    ["Clientes quitados", dados.quitados, CheckCircle2, "text-emerald-400"],
    ["Clientes em atraso", dados.atrasados, AlertTriangle, "text-red-400"],
    ["Valor total pendente", moeda(dados.valorPendente), Wallet, "text-yellow-400"],
  ] as const;

  return <div className="space-y-6">
    <CentralCobrancas atrasadas={dados.cobrancas.atrasadas} hoje={dados.cobrancas.hoje} lembrar={dados.cobrancas.tresDias} filtroAtivo={filtroCobranca} onFiltrar={setFiltroCobranca} />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{resumo.map(([titulo, valor, Icon, cor]) => <div key={titulo} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"><div className="flex items-start justify-between gap-2"><div><p className="text-xs text-zinc-400">{titulo}</p><p className="mt-1 text-lg font-bold text-white sm:text-xl">{valor}</p></div><Icon size={20} className={cor} /></div></div>)}</div>
    <ParcelasFiltro busca={busca} setBusca={setBusca} possuiFiltro={Boolean(busca || filtroCobranca)} limparFiltros={() => { setBusca(""); setFiltroCobranca(null); }} />
    {filtroCobranca && <p className="text-sm text-zinc-400">Filtro ativo: <span className="font-semibold text-white">{filtroCobranca === "ATRASADO" ? "clientes em atraso" : filtroCobranca === "HOJE" ? "clientes com vencimento hoje" : "clientes com vencimento em até 3 dias"}</span></p>}
    <div className="space-y-5">{dados.visiveis.length === 0 ? <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-16 text-center text-zinc-500">Nenhuma parcela encontrada.</div> : dados.visiveis.map((cliente) => <ClienteCard key={cliente.id} cliente={cliente.cliente} telefone={cliente.telefone} parcelas={cliente.parcelas} onExcluir={apagar} />)}</div>
  </div>;
}
