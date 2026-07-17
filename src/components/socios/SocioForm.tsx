"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  criarSocio,
  editarSocio,
  buscarSocio,
} from "@/services/socios";

import type { Socio } from "@/services/socios";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  id?: string;
}

export default function SocioForm({
  id,
}: Props) {

  const router = useRouter();

  const [carregando, setCarregando] =
    useState(false);

  const [socio, setSocio] = useState<Socio>({

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

    tipo: "PARCEIRO",

  });

  useEffect(() => {

    if (!id) return;

    carregar();

  }, [id]);

  async function carregar() {

    setCarregando(true);

    const dados =
      await buscarSocio(id!);

    if (dados) {

      setSocio({

        nome:
          dados.nome || "",

        cpf:
          dados.cpf || "",

        telefone:
          dados.telefone || "",

        email:
          dados.email || "",

        percentual:
          Number(
            dados.percentual || 0
          ),

        pix:
          dados.pix || "",

        status:
          dados.status || "ATIVO",

        usuario:
          dados.usuario || "",

        senha:
          dados.senha || "",

        perfil:
          dados.perfil || "SOCIO",

        tipo:
          dados.tipo || "PARCEIRO",

      });

    }

    setCarregando(false);

  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement
    >
  ) {

    const { name, value } =
      e.target;

    setSocio((old) => ({

      ...old,

      [name]:

        name === "percentual"

          ? Number(value)

          : value,

    }));

  }

  async function salvar() {

    if (id) {

      await editarSocio(
        id,
        socio
      );

      alert(
        "Sócio atualizado com sucesso!"
      );

    } else {

      await criarSocio(
        socio
      );

      alert(
        "Sócio cadastrado com sucesso!"
      );

    }

    router.push("/socios");

  }

  if (carregando) {

    return (

      <div className="text-white">

        Carregando...

      </div>

    );

  }

  return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">

      <h2 className="text-2xl font-bold text-white">

        {id
          ? "Editar Sócio"
          : "Novo Sócio"}

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

      <div className="grid grid-cols-3 gap-6">

        <div>

          <Label>PIX</Label>

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

        <div>

          <Label>Tipo de Sócio</Label>

          <select
            name="tipo"
            value={socio.tipo}
            onChange={handleChange}
            className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-white"
          >

            <option value="PARCEIRO">

              Parceiro

            </option>

            <option value="INVESTIDOR">

              Investidor

            </option>

          </select>

        </div>

      </div>

      <hr className="border-zinc-800" />

      <h3 className="text-xl font-semibold text-white">

        Acesso ao Sistema

      </h3>      <div className="grid grid-cols-3 gap-6">

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

      <div className="rounded-xl border border-blue-800 bg-blue-950/20 p-5">

        <h4 className="text-blue-300 font-semibold">

          Informações do Tipo de Sócio

        </h4>

        {socio.tipo === "PARCEIRO" ? (

          <p className="text-zinc-300 mt-3 text-sm leading-6">

            O parceiro participa dos investimentos e da divisão dos lucros
            conforme o percentual definido. No futuro ele terá acesso apenas
            aos clientes, produtos, vendas e parcelas vinculados ao próprio
            usuário.

          </p>

        ) : (

          <p className="text-zinc-300 mt-3 text-sm leading-6">

            O investidor acompanha apenas o capital investido, o capital
            recuperado, o saldo restante e os aparelhos vinculados a ele.
            Ele não visualizará informações financeiras dos demais sócios.

          </p>

        )}

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

          {id
            ? "Atualizar Sócio"
            : "Salvar Sócio"}

        </Button>

      </div>

    </div>

  );

}