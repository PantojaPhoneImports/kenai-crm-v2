"use client";

import { useEffect, useState } from "react";
import { Check, Download, FileText, MessageCircle, X } from "lucide-react";
import { jsPDF } from "jspdf";

import { Button } from "@/components/ui/button";
import { buscarClientePorId } from "@/services/clientes";
import { buscarProdutoPorId } from "@/services/estoque";
import { listarParcelas } from "@/services/parcelas";
import { buscarVendaPorId } from "@/services/vendas";

interface DadosRecibo {
  numero: string;
  cliente: string;
  telefone: string;
  produto: string;
  marca: string;
  modelo: string;
  cor: string;
  imei: string;
  socio: string;
  formaPagamento: string;
  valorParcela: number;
  entrada: number;
  valorTotal: number;
  parcelaAtual: number;
  totalParcelas: number;
  parcelasPagas: number;
  totalPago: number;
  saldoRestante: number;
  proximoVencimento: string | null;
  proximoValor: number | null;
  percentualPago: number;
  quitada: boolean;
  dataPagamento: string;
  horaPagamento: string;
  dataEmissao: string;
}

const ouro: [number, number, number] = [184, 134, 11];
const preto: [number, number, number] = [24, 24, 27];

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dataBrasileira(data?: string | Date | { seconds?: number }) {
  const valor = typeof data === "object" && data && "seconds" in data
    ? new Date(Number(data.seconds) * 1000)
    : data instanceof Date
      ? data
      : new Date(typeof data === "string" || typeof data === "number" ? data : Date.now());
  return Number.isNaN(valor.getTime()) ? "Não informado" : valor.toLocaleDateString("pt-BR");
}

function dadosDataPagamento(data?: string) {
  const valor = data ? new Date(data) : new Date();
  const segura = Number.isNaN(valor.getTime()) ? new Date() : valor;
  return {
    data: segura.toLocaleDateString("pt-BR"),
    hora: segura.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function numeroRecibo(parcela: unknown) {
  return `REC-${String(Math.max(Number(parcela) || 1, 1)).padStart(6, "0")}`;
}

function formatarImei(valor?: string) {
  const imei = String(valor || "").replace(/\D/g, "");
  if (!imei) return "Não informado";
  return [imei.slice(0, 2), imei.slice(2, 8), imei.slice(8, 14), imei.slice(14)]
    .filter(Boolean)
    .join(" ");
}

function formaPagamento(valor?: string) {
  const normalizado = String(valor || "").trim().toLowerCase();
  if (normalizado === "pix") return "PIX";
  if (normalizado.includes("dinheiro")) return "Dinheiro";
  if (normalizado.includes("cart")) return "Cartão";
  if (normalizado.includes("transfer")) return "Transferência";
  return "Não informado";
}

async function logoComoDataUrl() {
  const resposta = await fetch("/logo.png");
  const blob = await resposta.blob();
  return await new Promise<string>((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result));
    leitor.onerror = reject;
    leitor.readAsDataURL(blob);
  });
}

async function gerarPdf(dados: DadosRecibo) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const largura = pdf.internal.pageSize.getWidth();
  const margem = 17;
  let y = 14;

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, largura, 297, "F");
  try {
    pdf.addImage(await logoComoDataUrl(), "PNG", largura / 2 - 14, 7, 28, 28);
  } catch (error) {
    console.error("Não foi possível incluir a logo no PDF:", error);
  }
  pdf.setFillColor(...preto);
  pdf.rect(0, 39, largura, 14, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("RECIBO DE PAGAMENTO", margem, 48);
  pdf.setTextColor(...ouro);
  pdf.setFontSize(8.5);
  pdf.text("PANTOJA PHONE IMPORTS", largura - margem, 48, { align: "right" });

  y = 62;
  pdf.setTextColor(...preto);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text(dados.numero, margem, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Pagamento: ${dados.dataPagamento} às ${dados.horaPagamento}`, largura - margem, y, { align: "right" });
  pdf.setFillColor(220, 252, 231);
  pdf.roundedRect(largura - 67, y + 5, 50, 7, 2, 2, "F");
  pdf.setTextColor(22, 101, 52);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.text("PAGAMENTO CONFIRMADO", largura - 42, y + 9.7, { align: "center" });
  y += 18;

  const secao = (titulo: string) => {
    pdf.setFillColor(250, 247, 239);
    pdf.roundedRect(margem, y - 4.5, largura - margem * 2, 7, 1.2, 1.2, "F");
    pdf.setTextColor(...preto);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text(titulo.toUpperCase(), margem + 3, y);
    y += 8;
  };
  const linha = (rotulo: string, valor: string, coluna = 0) => {
    const x = coluna === 0 ? margem + 2 : largura / 2 + 3;
    pdf.setTextColor(113, 113, 122);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text(rotulo, x, y);
    pdf.setTextColor(...preto);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.2);
    pdf.text(valor || "Não informado", x, y + 4);
  };
  const duasColunas = (esquerda: [string, string], direita: [string, string]) => {
    linha(esquerda[0], esquerda[1]);
    linha(direita[0], direita[1], 1);
    y += 9;
  };

  secao("Cliente");
  duasColunas(["Nome", dados.cliente], ["Telefone", dados.telefone || "Não informado"]);
  secao("Aparelho");
  duasColunas(["Produto", dados.produto], ["Marca", dados.marca]);
  duasColunas(["Modelo", dados.modelo], ["Cor", dados.cor]);
  duasColunas(["IMEI", dados.imei], ["Sócio responsável", dados.socio]);
  secao("Venda");
  duasColunas(["Forma de pagamento", dados.formaPagamento], ["Valor da venda", moeda(dados.valorTotal)]);
  duasColunas(["Entrada", moeda(dados.entrada)], ["Valor da parcela", moeda(dados.valorParcela)]);
  secao("Financeiro");
  duasColunas(["Parcela paga", `${dados.parcelaAtual} de ${dados.totalParcelas}`], ["Parcelas pagas", String(dados.parcelasPagas)]);
  duasColunas(["Parcelas restantes", String(Math.max(dados.totalParcelas - dados.parcelasPagas, 0))], ["Total recebido", moeda(dados.totalPago)]);
  duasColunas(["Saldo restante", moeda(dados.saldoRestante)], ["Progresso", `${dados.percentualPago}% concluído`]);

  pdf.setFillColor(228, 228, 231);
  pdf.roundedRect(margem + 2, y, largura - margem * 2 - 4, 4, 2, 2, "F");
  pdf.setFillColor(...ouro);
  pdf.roundedRect(margem + 2, y, (largura - margem * 2 - 4) * dados.percentualPago / 100, 4, 2, 2, "F");
  y += 11;
  if (dados.quitada) {
    pdf.setTextColor(22, 101, 52);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("VENDA TOTALMENTE QUITADA", largura / 2, y, { align: "center" });
  } else {
    duasColunas(["Próximo vencimento", dados.proximoVencimento || "Não informado"], ["Valor da próxima parcela", moeda(dados.proximoValor || 0)]);
  }

  const rodapeY = 248;
  pdf.setDrawColor(...ouro);
  pdf.setLineWidth(0.5);
  pdf.line(margem, rodapeY, largura - margem, rodapeY);
  pdf.setTextColor(82, 82, 91);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.text("Documento emitido automaticamente pelo Kenai CRM", largura / 2, rodapeY + 7, { align: "center" });
  pdf.text(`Pantoja Phone Imports • Emissão: ${dados.dataEmissao}`, largura / 2, rodapeY + 12, { align: "center" });
  pdf.setDrawColor(161, 161, 170);
  pdf.line(largura / 2 - 36, rodapeY + 23, largura / 2 + 36, rodapeY + 23);
  pdf.setTextColor(...preto);
  pdf.setFont("helvetica", "bold");
  pdf.text("PANTOJA PHONE IMPORTS", largura / 2, rodapeY + 29, { align: "center" });
  pdf.setFont("helvetica", "normal");
  pdf.text("Sistema Kenai CRM", largura / 2, rodapeY + 34, { align: "center" });
  return pdf;
}

export default function ReciboPagamento({ parcela }: { parcela: any }) {
  const [aberto, setAberto] = useState(false);
  const [dados, setDados] = useState<DadosRecibo | null>(null);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    async function carregarDados() {
      const [produto, venda, parcelas, cliente] = await Promise.all([
        parcela.produtoId ? buscarProdutoPorId(parcela.produtoId) : Promise.resolve(null),
        parcela.vendaId ? buscarVendaPorId(parcela.vendaId) : Promise.resolve(null),
        listarParcelas(),
        parcela.clienteId ? buscarClientePorId(parcela.clienteId) : Promise.resolve(null),
      ]);
      const parcelasDaVenda = parcelas.filter((item) => item.vendaId === parcela.vendaId);
      const parcelasPagas = parcelasDaVenda.filter((item) => item.status === "PAGA");
      const proximaParcela = parcelasDaVenda
        .filter((item) => item.status !== "PAGA")
        .sort((a, b) => Number(a.parcela) - Number(b.parcela))[0];
      const totalParcelas = Number(parcela.totalParcelas || venda?.parcelas || parcelasDaVenda.length || 1);
      const entrada = Number(venda?.entrada || 0);
      const totalPago = entrada + parcelasPagas.reduce((total, item) => total + Number(item.valor || 0), 0);
      const valorTotal = Number(venda?.valorProduto || entrada + parcelasDaVenda.reduce((total, item) => total + Number(item.valor || 0), 0));
      const data = dadosDataPagamento(parcela.dataPagamento);
      const quitada = parcelasPagas.length >= totalParcelas;

      setDados({
        numero: numeroRecibo(parcela.parcela),
        cliente: parcela.clienteNome,
        telefone: cliente?.telefone || parcela.clienteTelefone || "",
        produto: parcela.produtoNome,
        marca: produto?.marca || "Não informado",
        modelo: produto?.modelo || "Não informado",
        cor: produto?.cor || "Não informada",
        imei: formatarImei(produto?.imei || venda?.imei),
        socio: parcela.socioNome || venda?.socioNome || produto?.socioNome || "Não informado",
        formaPagamento: formaPagamento(parcela.formaPagamento),
        valorParcela: Number(parcela.valor || 0), entrada, valorTotal,
        parcelaAtual: Number(parcela.parcela || 0), totalParcelas,
        parcelasPagas: parcelasPagas.length, totalPago,
        saldoRestante: Math.max(valorTotal - totalPago, 0),
        proximoVencimento: proximaParcela ? dataBrasileira(proximaParcela.vencimento) : null,
        proximoValor: proximaParcela ? Number(proximaParcela.valor || 0) : null,
        percentualPago: Math.min(Math.round((parcelasPagas.length / totalParcelas) * 100), 100),
        quitada, dataPagamento: data.data, horaPagamento: data.hora,
        dataEmissao: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
      });
    }
    carregarDados().catch((error) => console.error("Erro ao carregar recibo:", error));
  }, [aberto, parcela]);

  async function criarArquivoPdf() {
    if (!dados) return null;
    const pdf = await gerarPdf(dados);
    return new File([pdf.output("blob")], `${dados.numero.toLowerCase()}.pdf`, { type: "application/pdf" });
  }

  async function baixarPdf() {
    if (!dados) return;
    setGerandoPdf(true);
    try { (await gerarPdf(dados)).save(`${dados.numero.toLowerCase()}.pdf`); }
    finally { setGerandoPdf(false); }
  }

  async function compartilharWhatsapp() {
    if (!dados) return;
    const mensagem = "Olá, segue o comprovante do pagamento realizado. Muito obrigado pela preferência.";
    const arquivo = await criarArquivoPdf();
    if (arquivo && navigator.share && navigator.canShare?.({ files: [arquivo] })) {
      await navigator.share({ title: "Comprovante de pagamento", text: mensagem, files: [arquivo] });
      return;
    }
    const numero = dados.telefone.replace(/\D/g, "");
    window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`, "_blank");
  }

  const grupos: Array<[string, Array<[string, string]>]> = dados ? [
    ["Cliente", [["Nome", dados.cliente], ["Telefone", dados.telefone || "Não informado"]]],
    ["Aparelho", [["Produto", dados.produto], ["Marca", dados.marca], ["Modelo", dados.modelo], ["Cor", dados.cor], ["IMEI", dados.imei], ["Sócio responsável", dados.socio]]],
    ["Venda", [["Forma de pagamento", dados.formaPagamento], ["Valor da venda", moeda(dados.valorTotal)], ["Entrada", moeda(dados.entrada)], ["Valor da parcela", moeda(dados.valorParcela)]]],
    ["Financeiro", [["Parcela paga", `${dados.parcelaAtual} de ${dados.totalParcelas}`], ["Parcelas pagas", String(dados.parcelasPagas)], ["Parcelas restantes", String(Math.max(dados.totalParcelas - dados.parcelasPagas, 0))], ["Total recebido", moeda(dados.totalPago)], ["Saldo restante", moeda(dados.saldoRestante)]]],
  ] : [];

  return <>
    <Button size="sm" variant="outline" onClick={() => setAberto(true)}><FileText size={16} /> Gerar Recibo</Button>
    {aberto && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="relative border-t-8 border-zinc-950 px-6 pb-5 pt-4 text-center sm:px-10">
          <Button className="absolute right-3 top-3 text-zinc-950 hover:bg-zinc-100" size="icon" variant="ghost" aria-label="Fechar recibo" onClick={() => setAberto(false)}><X /></Button>
          <img src="/logo.png" alt="Logo Pantoja Phone Imports" className="mx-auto size-24 rounded-full object-cover ring-2 ring-[#b8860b] sm:size-28" />
          <p className="mt-3 text-sm font-bold tracking-[0.16em] text-zinc-950">PANTOJA PHONE IMPORTS</p>
        </div>
        <div className="flex items-center justify-between bg-zinc-950 px-5 py-3 text-white sm:px-8">
          <h2 className="text-sm font-bold tracking-wider">RECIBO DE PAGAMENTO</h2>
          <span className="text-xs font-semibold text-[#d4af37]">{dados?.numero || ""}</span>
        </div>
        {!dados ? <p className="py-16 text-center text-zinc-500">Preparando recibo...</p> : <div className="p-5 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 border-b border-[#d4af37]/60 pb-4 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
            <span>Pagamento em {dados.dataPagamento} às {dados.horaPagamento}</span>
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-green-100 px-3 py-1 font-bold text-green-700"><Check size={15} /> PAGAMENTO CONFIRMADO</span>
          </div>
          <div className="space-y-6">{grupos.map(([titulo, campos]) => <section key={titulo} className="rounded-xl border border-zinc-200 p-4 sm:p-5">
            <h3 className="border-l-4 border-[#b8860b] bg-[#faf7ef] px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-950">{titulo}</h3>
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 px-1 pt-4 text-sm sm:grid-cols-2">{campos.map(([rotulo, valor]) => <div key={rotulo} className="border-b border-zinc-200 pb-2"><p className="text-xs text-zinc-500">{rotulo}</p><p className="mt-1 font-semibold text-zinc-950">{valor}</p></div>)}</div>
          </section>)}</div>
          <section className="mt-6 rounded-xl border border-zinc-200 p-4 sm:p-5"><div className="flex items-center justify-between text-sm"><h3 className="font-bold text-zinc-950">Progresso do pagamento</h3><span className="font-semibold text-[#8a6500]">{dados.percentualPago}% concluído</span></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-200"><div className="h-full rounded-full bg-[#b8860b] transition-all" style={{ width: `${dados.percentualPago}%` }} /></div>{dados.quitada ? <p className="mt-4 text-center font-bold text-green-700">VENDA TOTALMENTE QUITADA</p> : <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2"><p><span className="text-zinc-500">Próximo vencimento:</span> <strong className="text-zinc-950">{dados.proximoVencimento}</strong></p><p><span className="text-zinc-500">Valor da próxima parcela:</span> <strong className="text-zinc-950">{moeda(dados.proximoValor || 0)}</strong></p></div>}</section>
          <footer className="mt-8 border-t border-[#d4af37] pt-5 text-center text-sm leading-6 text-zinc-600"><p>Documento emitido automaticamente pelo Kenai CRM</p><p>Pantoja Phone Imports</p><p>Emissão: {dados.dataEmissao}</p><div className="mx-auto mt-6 w-56 border-t border-zinc-400" /><p className="mt-2 font-bold tracking-wider text-zinc-950">PANTOJA PHONE IMPORTS</p><p className="text-xs">Sistema Kenai CRM</p></footer>
          <div className="mt-7 grid gap-3 sm:grid-cols-2"><Button className="bg-zinc-950 text-white hover:bg-zinc-800" onClick={baixarPdf} disabled={gerandoPdf}><Download size={16} /> {gerandoPdf ? "Gerando PDF..." : "Baixar PDF"}</Button><Button className="border-[#b8860b] text-zinc-950 hover:bg-[#faf7ef]" variant="outline" onClick={compartilharWhatsapp} disabled={!dados.telefone} title={!dados.telefone ? "Cliente sem telefone cadastrado" : undefined}><MessageCircle size={16} /> Compartilhar pelo WhatsApp</Button></div>
        </div>}
      </div>
    </div>}
  </>;
}
