"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { listarClientes, editarCliente } from "@/services/clientes";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ClienteEditarForm() {

  const router = useRouter();

  const params = useParams();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
    profissao: "",
    observacoes: "",
  });

  useEffect(() => {
    carregarCliente();
  }, []);

  async function carregarCliente() {

    const clientes = await listarClientes();

    const cliente = clientes.find(
      (c: any) => c.id === params.id
    );

    if (!cliente) return;

    setForm({
      nome: cliente.nome || "",
      cpf: cliente.cpf || "",
      telefone: cliente.telefone || "",
      email: cliente.email || "",
      profissao: cliente.profissao || "",
      observacoes: cliente.observacoes || "",
    });

    setLoading(false);

  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  }

  async function salvar() {

    await editarCliente(
      params.id as string,
      form
    );

    alert("Cliente atualizado com sucesso!");

    router.push("/clientes");

  }

  if (loading) {

    return (
      <p className="text-white">
        Carregando...
      </p>
    );

  }
    return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">

      <h2 className="text-2xl font-bold text-white">
        Editar Cliente
      </h2>

      <div>

        <Label>Nome</Label>

        <Input
          name="nome"
          value={form.nome}
          onChange={handleChange}
        />

      </div>

      <div className="grid grid-cols-2 gap-6">

        <div>

          <Label>CPF</Label>

          <Input
            name="cpf"
            value={form.cpf}
            onChange={handleChange}
          />

        </div>

        <div>

          <Label>Telefone</Label>

          <Input
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
          />

        </div>

      </div>

      <div>

        <Label>E-mail</Label>

        <Input
          name="email"
          value={form.email}
          onChange={handleChange}
        />

      </div>

      <div>

        <Label>Profissão</Label>

        <Input
          name="profissao"
          value={form.profissao}
          onChange={handleChange}
        />

      </div>

      <div>

        <Label>Observações</Label>

        <textarea
          name="observacoes"
          value={form.observacoes}
          onChange={handleChange}
          rows={5}
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white"
        />

      </div>

      <div className="flex justify-end gap-3">

        <Button
          variant="outline"
          onClick={() => router.push("/clientes")}
        >
          Cancelar
        </Button>

        <Button
          onClick={salvar}
        >
          Salvar Alterações
        </Button>

      </div>

    </div>

  );

}