"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {

  criarDespesa,

  editarDespesa,

} from "../../services/despesas";

import { Button } from "../ui/button";

import { Input } from "../ui/input";

import { Label } from "../ui/label";

interface Props {

  despesa?: any;

}

export default function DespesaForm({

  despesa,

}: Props) {

  const router = useRouter();

  const editando = !!despesa;

  const [descricao, setDescricao] = useState(

    despesa?.descricao || ""

  );

  const [categoria, setCategoria] = useState(

    despesa?.categoria || ""

  );

  const [valor, setValor] = useState(

    despesa?.valor || ""

  );

  const [data, setData] = useState(

    despesa?.data

      ? new Date(despesa.data.seconds * 1000)

          .toISOString()

          .substring(0, 10)

      : new Date()

          .toISOString()

          .substring(0, 10)

  );

  const [loading, setLoading] = useState(false);
    async function salvar() {

    try {

      setLoading(true);

      const dados = {

        descricao,

        categoria,

        valor: Number(valor),

        data: new Date(data),

      };

      if (editando) {

        await editarDespesa(

          despesa.id,

          dados

        );

      } else {

        await criarDespesa(

          dados

        );

      }

      alert(

        editando

          ? "Despesa atualizada com sucesso!"

          : "Despesa cadastrada com sucesso!"

      );

      router.push("/despesas");

      router.refresh();

    } catch (error) {

      console.error(error);

      alert("Erro ao salvar despesa.");

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">

      <h2 className="text-2xl font-bold text-white">

        {editando

          ? "Editar Despesa"

          : "Nova Despesa"}

      </h2>

      <div>

        <Label>

          Descrição

        </Label>

        <Input

          value={descricao}

          onChange={(e) =>

            setDescricao(e.target.value)

          }

          placeholder="Ex: Conta de Energia"

        />

      </div>
            <div>

        <Label>

          Categoria

        </Label>

        <Input

          value={categoria}

          onChange={(e) =>

            setCategoria(e.target.value)

          }

          placeholder="Ex: Aluguel"

        />

      </div>

      <div>

        <Label>

          Valor

        </Label>

        <Input

          type="number"

          value={valor}

          onChange={(e) =>

            setValor(e.target.value)

          }

          placeholder="0,00"

        />

      </div>

      <div>

        <Label>

          Data

        </Label>

        <Input

          type="date"

          value={data}

          onChange={(e) =>

            setData(e.target.value)

          }

        />

      </div>

      <div className="flex justify-end gap-4">

        <Button

          type="button"

          variant="outline"

          onClick={() => router.back()}

        >

          Cancelar

        </Button>
                <Button

          type="button"

          onClick={salvar}

          disabled={loading}

        >

          {loading

            ? "Salvando..."

            : editando

              ? "Atualizar"

              : "Cadastrar"}

        </Button>

      </div>

    </div>
      );

}