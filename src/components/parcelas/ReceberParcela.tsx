"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { receberParcela } from "@/services/parcelas";
import { buscarProdutoPorId } from "@/services/estoque";
import ReciboPagamento from "./ReciboPagamento";
import { formatarData, formatarDataHora } from "@/lib/data";

interface Props {
  parcela: any;
}

export default function ReceberParcela({
  parcela,
}: Props) {

  const router = useRouter();

  const [formaPagamento, setFormaPagamento] =
    useState("PIX");

  const [loading, setLoading] =
    useState(false);
  const [produto, setProduto] = useState<{ cor?: string; imei?: string } | null>(null);
  const [paga, setPaga] = useState(parcela.status === "PAGA");

  useEffect(() => {
    if (!parcela.produtoId) return;

    buscarProdutoPorId(parcela.produtoId)
      .then(setProduto)
      .catch((error) => console.error("Erro ao carregar aparelho da parcela:", error));
  }, [parcela.produtoId]);

  async function receber() {

    try {

      setLoading(true);

      await receberParcela(

        parcela.id,

        formaPagamento,

        "",

        ""

      );

      alert("Parcela recebida com sucesso!");

      router.refresh();
      setPaga(true);

    } catch (error) {

      console.error(error);

      alert("Erro ao receber parcela.");

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">

      <h2 className="text-2xl font-bold text-white">
        Receber Parcela
      </h2>

      <div>

        <Label>Criada em</Label>

        <p className="mt-2 text-white">{formatarDataHora(parcela.createdAt)}</p>

      </div>

      <div>

        <Label>Vencimento</Label>

        <p className="mt-2 text-white">{formatarData(parcela.vencimento)}</p>

      </div>

      {parcela.status === "PAGA" && <div>

        <Label>Pagamento</Label>

        <p className="mt-2 text-white">{formatarDataHora(parcela.dataPagamento)}</p>

      </div>}

      <div>

        <Label>Cliente</Label>

        <p className="mt-2 text-white">
          {parcela.clienteNome}
        </p>

      </div>

      <div>

        <Label>Cor</Label>

        <p className="mt-2 text-white">
          {produto?.cor || "Não informada"}
        </p>

      </div>

      <div>

        <Label>IMEI</Label>

        <p className="mt-2 text-white">
          {produto?.imei || "Não informado"}
        </p>

      </div>

      <div>

        <Label>Sócio responsável</Label>

        <p className="mt-2 text-white">
          {parcela.socioNome || "Não informado"}
        </p>

      </div>

      <div>

        <Label>Produto</Label>

        <p className="mt-2 text-white">
          {parcela.produtoNome}
        </p>

      </div>

      <div>

        <Label>Quantidade de parcelas</Label>

        <p className="mt-2 text-white">
          {parcela.totalParcelas}
        </p>

      </div>

      <div>

        <Label>Parcela atual</Label>

        <p className="mt-2 text-white">
          {parcela.parcela} de {parcela.totalParcelas}
        </p>

      </div>

      {!paga && <>

      <div>

        <Label>Valor</Label>

        <p className="mt-2 text-green-400 text-xl font-bold">

          {Number(parcela.valor).toLocaleString(
            "pt-BR",
            {
              style: "currency",
              currency: "BRL",
            }
          )}

        </p>

      </div>

      <div>

        <Label>Forma de Pagamento</Label>

        <select
          className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-white"
          value={formaPagamento}
          onChange={(e) =>
            setFormaPagamento(e.target.value)
          }
        >

          <option value="PIX">PIX</option>

          <option value="Dinheiro">
            Dinheiro
          </option>

          <option value="Cartão de Débito">
            Cartão de Débito
          </option>

          <option value="Cartão de Crédito">
            Cartão de Crédito
          </option>

          <option value="Transferência">
            Transferência
          </option>

        </select>

      </div>

      </>}

      {paga ? (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5">
          <p className="font-semibold text-green-400">Pagamento confirmado.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ReciboPagamento parcela={{ ...parcela, status: "PAGA", dataPagamento: new Date().toISOString() }} />
            <Button variant="outline" onClick={() => router.push("/parcelas")}>Voltar para parcelas</Button>
          </div>
        </div>
      ) : <div className="grid grid-cols-2 gap-4">

        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >

          Cancelar

        </Button>

        <Button
          onClick={receber}
          disabled={loading}
        >

          {loading
            ? "Recebendo..."
            : "Confirmar Recebimento"}

        </Button>

      </div>}

    </div>

  );

}
