"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (
    formaPagamento: string,
    dataPagamento: string,
    observacao: string
  ) => void;
};

export default function ReceberModal({
  open,
  onClose,
  onConfirm,
}: Props) {
  const [formaPagamento, setFormaPagamento] = useState("PIX");
  const [dataPagamento, setDataPagamento] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [observacao, setObservacao] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center sm:p-6">

      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-5 sm:p-8">

        <h2 className="text-2xl font-bold text-white">
          Receber Parcela
        </h2>

        <div>
          <Label>Forma de Pagamento</Label>

          <select
            className="mt-2 w-full rounded-lg bg-zinc-950 border border-zinc-700 p-3"
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
          >
            <option>PIX</option>
            <option>Dinheiro</option>
            <option>Cartão</option>
            <option>Transferência</option>
          </select>
        </div>

        <div>
          <Label>Data do Pagamento</Label>

          <Input
            type="date"
            value={dataPagamento}
            onChange={(e) => setDataPagamento(e.target.value)}
          />
        </div>

        <div>
          <Label>Observação</Label>

          <Input
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <Button
            className="w-full sm:w-auto" variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            className="w-full sm:w-auto" onClick={() =>
              onConfirm(
                formaPagamento,
                dataPagamento,
                observacao
              )
            }
          >
            Confirmar
          </Button>

        </div>

      </div>

    </div>
  );
}
