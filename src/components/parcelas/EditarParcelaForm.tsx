"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  buscarParcela,
  atualizarParcela,
} from "@/services/parcelas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  id: string;
};

export default function EditarParcelaForm({
  id,
}: Props) {

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    valor: "",
    vencimento: "",
    status: "",
  });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {

    const parcela = await buscarParcela(id);

    if (!parcela) return;

    const data = parcela.vencimento?.seconds
      ? new Date(
          parcela.vencimento.seconds * 1000
        )
      : new Date(parcela.vencimento);

    setForm({
      valor: String(parcela.valor),
      vencimento: data
        .toISOString()
        .substring(0, 10),
      status: parcela.status,
    });

    setLoading(false);

  }

  async function salvar() {

    await atualizarParcela(id, {

      valor: Number(form.valor),

      vencimento: new Date(form.vencimento),

      status: form.status,

    });

    alert("Parcela atualizada.");

    router.push("/parcelas");

  }

  if (loading)
    return (
      <div className="p-10">
        Carregando...
      </div>
    );

  return (

    <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">

      <h1 className="text-3xl font-bold">

        Editar Parcela

      </h1>

      <Input
        type="number"
        value={form.valor}
        onChange={(e)=>

          setForm({

            ...form,

            valor:e.target.value,

          })

        }
      />

      <Input
        type="date"
        value={form.vencimento}
        onChange={(e)=>

          setForm({

            ...form,

            vencimento:e.target.value,

          })

        }
      />

      <select

        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3"

        value={form.status}

        onChange={(e)=>

          setForm({

            ...form,

            status:e.target.value,

          })

        }

      >

        <option value="PENDENTE">
          PENDENTE
        </option>

        <option value="PAGA">
          PAGA
        </option>

      </select>

      <Button
        onClick={salvar}
      >

        Salvar Alterações

      </Button>

    </div>

  );

}