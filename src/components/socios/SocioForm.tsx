"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  criarSocio,
} from "../../services/socios";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SocioForm() {

  const router = useRouter();

  const [socio, setSocio] = useState({

    nome: "",

    cpf: "",

    telefone: "",

    email: "",

    percentual: 0,

    pix: "",

    status: "ATIVO",

    usuario: "",

    senha: "",

    perfil: "SOCIO",

  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {

    const { name, value } = e.target;

    setSocio((old) => ({

      ...old,

      [name]:
        name === "percentual"
          ? Number(value)
          : value,

    }));

  }

  async function salvar() {

    await criarSocio(socio);

    alert("Sócio cadastrado com sucesso!");

    router.push("/socios");

  }

  return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">

      <h2 className="text-2xl font-bold text-white">

        Novo Sócio

      </h2>
            <div>

        <Label>Nome</Label>

        <Input
          name="nome"
          value={socio.nome}
          onChange={handleChange}
        />

      </div>

      <div className="grid grid-cols-2 gap-6">

        <div>

          <Label>CPF</Label>

          <Input
            name="cpf"
            value={socio.cpf}
            onChange={handleChange}
          />

        </div>

        <div>

          <Label>Telefone</Label>

          <Input
            name="telefone"
            value={socio.telefone}
            onChange={handleChange}
          />

        </div>

      </div>

      <div className="grid grid-cols-2 gap-6">

        <div>

          <Label>E-mail</Label>

          <Input
            type="email"
            name="email"
            value={socio.email}
            onChange={handleChange}
          />

        </div>

        <div>

          <Label>Percentual (%)</Label>

          <Input
            type="number"
            name="percentual"
            value={socio.percentual}
            onChange={handleChange}
          />

        </div>

      </div>

      <div className="grid grid-cols-2 gap-6">

        <div>

          <Label>Chave Pix</Label>

          <Input
            name="pix"
            value={socio.pix}
            onChange={handleChange}
          />

        </div>

        <div>

          <Label>Status</Label>

          <select
            name="status"
            value={socio.status}
            onChange={handleChange}
            className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-white"
          >

            <option value="ATIVO">

              Ativo

            </option>

            <option value="INATIVO">

              Inativo

            </option>

          </select>

        </div>

      </div>

      <hr className="border-zinc-800" />

      <h3 className="text-xl font-semibold text-white">

        Acesso ao Sistema

      </h3>

      <div className="grid grid-cols-3 gap-6">

        <div>

          <Label>Usuário</Label>

          <Input
            name="usuario"
            value={socio.usuario}
            onChange={handleChange}
          />

        </div>

        <div>

          <Label>Senha</Label>

          <Input
            type="password"
            name="senha"
            value={socio.senha}
            onChange={handleChange}
          />

        </div>

        <div>

          <Label>Perfil</Label>

          <select
            name="perfil"
            value={socio.perfil}
            onChange={handleChange}
            className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-white"
          >

            <option value="SOCIO">

              Sócio

            </option>

            <option value="ADMIN">

              Administrador

            </option>

          </select>

        </div>

      </div>
            <div className="flex justify-end gap-3">

        <Button
          variant="outline"
          onClick={() => router.push("/socios")}
        >
          Cancelar
        </Button>

        <Button
          onClick={salvar}
        >
          Salvar Sócio
        </Button>

      </div>

    </div>

  );

}