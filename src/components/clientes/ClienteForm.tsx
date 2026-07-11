"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { criarCliente } from "@/services/clientes";
import { buscarCEP } from "../../services/cep";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ClienteForm() {

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    rg: "",
    nascimento: "",
    estadoCivil: "",
    profissao: "",
    telefone: "",
    telefone2: "",
    email: "",
    cep: "",
    endereco: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    complemento: "",
    nomeMae: "",
    nomePai: "",
    observacoes: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {

    setForm((old) => ({
      ...old,
      [e.target.name]: e.target.value,
    }));

  }

  async function consultarCEP() {

    const dados = await buscarCEP(form.cep);

    if (!dados) return;

    setForm((old) => ({
      ...old,
      endereco: dados.endereco,
      bairro: dados.bairro,
      cidade: dados.cidade,
      estado: dados.estado,
    }));

  }

  async function salvarCliente() {

    setLoading(true);

    try {

      await criarCliente(form);

      alert("Cliente salvo com sucesso!");

      router.push("/clientes");

    } catch (error) {

      console.error(error);

      alert("Erro ao salvar cliente.");

    }

    setLoading(false);

  }

  return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-8">

      <h2 className="text-2xl font-bold text-white">
        Cadastro de Cliente
      </h2>

      <div>

        <Label>Nome Completo</Label>

        <Input
          name="nome"
          value={form.nome}
          onChange={handleChange}
        />

      </div>

      <div className="grid grid-cols-3 gap-6">

        <Input
          placeholder="CPF"
          name="cpf"
          value={form.cpf}
          onChange={handleChange}
        />

        <Input
          placeholder="RG"
          name="rg"
          value={form.rg}
          onChange={handleChange}
        />

        <Input
          type="date"
          name="nascimento"
          value={form.nascimento}
          onChange={handleChange}
        />

      </div>

      <div className="grid grid-cols-2 gap-6">

        <Input
          placeholder="Estado Civil"
          name="estadoCivil"
          value={form.estadoCivil}
          onChange={handleChange}
        />

        <Input
          placeholder="Profissão"
          name="profissao"
          value={form.profissao}
          onChange={handleChange}
        />

      </div>

      <div className="grid grid-cols-3 gap-6">

        <Input
          placeholder="Telefone"
          name="telefone"
          value={form.telefone}
          onChange={handleChange}
        />

        <Input
          placeholder="Telefone 2"
          name="telefone2"
          value={form.telefone2}
          onChange={handleChange}
        />

        <Input
          placeholder="E-mail"
          name="email"
          value={form.email}
          onChange={handleChange}
        />

      </div>

      <div className="grid grid-cols-4 gap-6">

        <Input
          placeholder="CEP"
          name="cep"
          value={form.cep}
          onChange={handleChange}
          onBlur={consultarCEP}
        />

        <div className="col-span-2">

          <Input
            placeholder="Endereço"
            name="endereco"
            value={form.endereco}
            onChange={handleChange}
          />

        </div>

        <Input
          placeholder="Número"
          name="numero"
          value={form.numero}
          onChange={handleChange}
        />

      </div>

      <div className="grid grid-cols-3 gap-6">

        <Input
          placeholder="Bairro"
          name="bairro"
          value={form.bairro}
          onChange={handleChange}
        />

        <Input
          placeholder="Cidade"
          name="cidade"
          value={form.cidade}
          onChange={handleChange}
        />

        <Input
          placeholder="Estado"
          name="estado"
          value={form.estado}
          onChange={handleChange}
        />

      </div>

      <Input
        placeholder="Complemento"
        name="complemento"
        value={form.complemento}
        onChange={handleChange}
      />

      <div className="grid grid-cols-2 gap-6">

        <Input
          placeholder="Nome da Mãe"
          name="nomeMae"
          value={form.nomeMae}
          onChange={handleChange}
        />

        <Input
          placeholder="Nome do Pai"
          name="nomePai"
          value={form.nomePai}
          onChange={handleChange}
        />

      </div>

      <textarea
        rows={5}
        placeholder="Observações"
        name="observacoes"
        value={form.observacoes}
        onChange={handleChange}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white"
      />

      <div className="flex justify-end">

        <Button
          onClick={salvarCliente}
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar Cliente"}
        </Button>

      </div>

    </div>

  );

}