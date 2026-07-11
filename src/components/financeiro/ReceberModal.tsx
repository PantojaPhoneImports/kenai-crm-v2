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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-zinc-900 rounded-xl p-8 w-[450px] border border-zinc-700 space-y-5">

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

        <div className="flex justify-end gap-3">

          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            onClick={() =>
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