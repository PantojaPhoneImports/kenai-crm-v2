"use client";

import { useEffect, useState } from "react";
import { Download, FileText, MessageCircle, X } from "lucide-react";
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
  dataPagamento: string;
  horaPagamento: string;
}

const ouro: [number, number, number] = [184, 134, 11];
const preto: [number, number, number] = [24, 24, 27];

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dataPagamento(data?: string) {
  const valor = data ? new Date(data) : new Date();
  const segura = Number.isNaN(valor.getTime()) ? new Date() : valor;
  return {
    data: segura.toLocaleDateString("pt-BR"),
    hora: segura.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function numeroRecibo(id?: string) {
  const valor = [...String(id || "recibo")].reduce(
    (total, caractere) => (total * 31 + caractere.charCodeAt(0)) % 1_000_000,
    0
  );
  return `REC-${String(valor || 1).padStart(6, "0")}`;
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
  const margem = 18;
  let y = 16;

  pdf.setFillColor(...preto);
  pdf.rect(0, 0, largura, 58, "F");
  try {
    pdf.addImage(await logoComoDataUrl(), "PNG", largura / 2 - 15, 7, 30, 30);
  } catch (error) {
    console.error("Não foi possível incluir a logo no PDF:", error);
  }
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text("PANTOJA PHONE IMPORTS", largura / 2, 43, { align: "center" });
  pdf.setTextColor(...ouro);
  pdf.setFontSize(10);
  pdf.text("RECIBO DE PAGAMENTO", largura / 2, 50, { align: "center" });

  y = 67;
  pdf.setTextColor(...preto);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text(dados.numero, margem, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Pagamento em ${dados.dataPagamento} às ${dados.horaPagamento}`, largura - margem, y, { align: "right" });
  pdf.setDrawColor(...ouro);
  pdf.setLineWidth(0.8);
  pdf.line(margem, y + 4, largura - margem, y + 4);
  y += 13;

  const secao = (titulo: string) => {
    pdf.setFillColor(250, 247, 239);
    pdf.roundedRect(margem, y - 5, largura - margem * 2, 8, 1.5, 1.5, "F");
    pdf.setTextColor(...preto);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(titulo.toUpperCase(), margem + 4, y);
    y += 9;
  };
  const linha = (rotulo: string, valor: string, coluna = 0) => {
    const x = coluna === 0 ? margem + 2 : largura / 2 + 4;
    pdf.setTextColor(113, 113, 122);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(rotulo, x, y);
    pdf.setTextColor(...preto);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(valor || "Não informado", x, y + 4.5);
  };
  const duasColunas = (esquerda: [string, string], direita: [string, string]) => {
    linha(esquerda[0], esquerda[1]);
    linha(direita[0], direita[1], 1);
    y += 11;
  };

  secao("Dados do cliente");
  duasColunas(["Nome", dados.cliente], ["Telefone", dados.telefone || "Não informado"]);

  secao("Dados do aparelho");
  duasColunas(["Produto", dados.produto], ["Marca", dados.marca]);
  duasColunas(["Modelo", dados.modelo], ["Cor", dados.cor]);
  duasColunas(["IMEI", dados.imei], ["Sócio responsável", dados.socio]);

  secao("Dados da venda");
  duasColunas(["Forma de pagamento", dados.formaPagamento], ["Valor da venda", moeda(dados.valorTotal)]);
  duasColunas(["Entrada", moeda(dados.entrada)], ["Valor da parcela", moeda(dados.valorParcela)]);
  duasColunas(["Parcela paga", `${dados.parcelaAtual} de ${dados.totalParcelas}`], ["Parcelas pagas", String(dados.parcelasPagas)]);
  duasColunas(["Parcelas restantes", String(Math.max(dados.totalParcelas - dados.parcelasPagas, 0))], ["Total recebido", moeda(dados.totalPago)]);
  duasColunas(["Saldo restante", moeda(dados.saldoRestante)], ["Status", "Pagamento confirmado"]);

  const rodapeY = Math.max(y + 4, 224);
  pdf.setDrawColor(...ouro);
  pdf.setLineWidth(0.5);
  pdf.line(margem, rodapeY, largura - margem, rodapeY);
  pdf.setTextColor(82, 82, 91);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.text("Este recibo comprova o pagamento da parcela informada.", largura / 2, rodapeY + 9, { align: "center" });
  pdf.text("Obrigado pela preferência.", largura / 2, rodapeY + 15, { align: "center" });
  pdf.setTextColor(...preto);
  pdf.setFont("helvetica", "bold");
  pdf.text("PANTOJA PHONE IMPORTS", largura / 2, rodapeY + 22, { align: "center" });

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
      const totalParcelas = Number(parcela.totalParcelas || venda?.parcelas || parcelasDaVenda.length || 1);
      const entrada = Number(venda?.entrada || 0);
      const totalPago = entrada + parcelasPagas.reduce((total, item) => total + Number(item.valor || 0), 0);
      const valorTotal = Number(venda?.valorProduto || entrada + parcelasDaVenda.reduce((total, item) => total + Number(item.valor || 0), 0));
      const data = dataPagamento(parcela.dataPagamento);

      setDados({
        numero: numeroRecibo(parcela.id || parcela.vendaId),
        cliente: parcela.clienteNome,
        telefone: cliente?.telefone || parcela.clienteTelefone || "",
        produto: parcela.produtoNome,
        marca: produto?.marca || "Não informado",
        modelo: produto?.modelo || "Não informado",
        cor: produto?.cor || "Não informada",
        imei: produto?.imei || venda?.imei || "Não informado",
        socio: parcela.socioNome || venda?.socioNome || produto?.socioNome || "Não informado",
        formaPagamento: formaPagamento(parcela.formaPagamento),
        valorParcela: Number(parcela.valor || 0),
        entrada,
        valorTotal,
        parcelaAtual: Number(parcela.parcela || 0),
        totalParcelas,
        parcelasPagas: parcelasPagas.length,
        totalPago,
        saldoRestante: Math.max(valorTotal - totalPago, 0),
        dataPagamento: data.data,
        horaPagamento: data.hora,
      });
    }

    carregarDados().catch((error) => console.error("Erro ao carregar recibo:", error));
  }, [aberto, parcela]);

  async function baixarPdf() {
    if (!dados) return;
    setGerandoPdf(true);
    try {
      const pdf = await gerarPdf(dados);
      pdf.save(`${dados.numero.toLowerCase()}.pdf`);
    } finally {
      setGerandoPdf(false);
    }
  }

  function compartilharWhatsapp() {
    if (!dados) return;
    const numero = dados.telefone.replace(/\D/g, "");
    const mensagem = "Olá, segue o recibo referente ao pagamento da parcela do seu aparelho.\nMuito obrigado pela confiança na Pantoja Phone Imports.";
    window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`, "_blank");
  }

  const grupos: Array<[string, Array<[string, string]>]> = dados ? [
    ["Dados do cliente", [["Nome", dados.cliente], ["Telefone", dados.telefone || "Não informado"]]],
    ["Dados do aparelho", [["Produto", dados.produto], ["Marca", dados.marca], ["Modelo", dados.modelo], ["Cor", dados.cor], ["IMEI", dados.imei]]],
    ["Dados da venda", [["Sócio responsável", dados.socio], ["Forma de pagamento", dados.formaPagamento], ["Valor da venda", moeda(dados.valorTotal)], ["Entrada", moeda(dados.entrada)], ["Parcela paga", `${dados.parcelaAtual} de ${dados.totalParcelas}`], ["Parcelas pagas", String(dados.parcelasPagas)], ["Parcelas restantes", String(Math.max(dados.totalParcelas - dados.parcelasPagas, 0))], ["Total recebido", moeda(dados.totalPago)], ["Saldo restante", moeda(dados.saldoRestante)]]],
  ] : [];

  return <>
    <Button size="sm" variant="outline" onClick={() => setAberto(true)}>
      <FileText size={16} /> Gerar Recibo
    </Button>

    {aberto && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4">
        <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div className="relative bg-zinc-950 px-6 pb-7 pt-5 text-center sm:px-10">
            <Button className="absolute right-3 top-3 text-white hover:bg-white/10 hover:text-white" size="icon" variant="ghost" aria-label="Fechar recibo" onClick={() => setAberto(false)}><X /></Button>
            <img src="/logo.png" alt="Logo Pantoja Phone Imports" className="mx-auto size-24 rounded-full object-cover ring-2 ring-[#b8860b] sm:size-28" />
            <p className="mt-3 text-sm font-bold tracking-[0.16em] text-white">PANTOJA PHONE IMPORTS</p>
            <h2 className="mt-1 text-xs font-semibold tracking-[0.24em] text-[#d4af37]">RECIBO DE PAGAMENTO</h2>
          </div>

          {!dados ? <p className="py-16 text-center text-zinc-500">Preparando recibo...</p> : <div className="p-5 sm:p-8">
            <div className="mb-6 flex flex-col gap-2 border-b border-[#d4af37]/60 pb-4 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-bold text-zinc-950">{dados.numero}</span>
              <span>Pagamento em {dados.dataPagamento} às {dados.horaPagamento}</span>
            </div>

            <div className="space-y-6">
              {grupos.map(([titulo, campos]) => <section key={titulo}>
                <h3 className="border-l-4 border-[#b8860b] bg-[#faf7ef] px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-950">{titulo}</h3>
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 px-1 pt-4 text-sm sm:grid-cols-2">
                  {campos.map(([rotulo, valor]) => <div key={rotulo} className="border-b border-zinc-200 pb-2">
                    <p className="text-xs text-zinc-500">{rotulo}</p>
                    <p className="mt-1 font-semibold text-zinc-950">{valor}</p>
                  </div>)}
                </div>
              </section>)}
            </div>

            <footer className="mt-8 border-t border-[#d4af37] pt-5 text-center text-sm leading-6 text-zinc-600">
              <p>Este recibo comprova o pagamento da parcela informada.</p>
              <p>Obrigado pela preferência.</p>
              <p className="mt-2 font-bold tracking-wider text-zinc-950">PANTOJA PHONE IMPORTS</p>
            </footer>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Button className="bg-zinc-950 text-white hover:bg-zinc-800" onClick={baixarPdf} disabled={gerandoPdf}><Download size={16} /> {gerandoPdf ? "Gerando PDF..." : "Baixar PDF"}</Button>
              <Button className="border-[#b8860b] text-zinc-950 hover:bg-[#faf7ef]" variant="outline" onClick={compartilharWhatsapp} disabled={!dados.telefone} title={!dados.telefone ? "Cliente sem telefone cadastrado" : undefined}><MessageCircle size={16} /> Compartilhar pelo WhatsApp</Button>
            </div>
          </div>}
        </div>
      </div>
    )}
  </>;
}
