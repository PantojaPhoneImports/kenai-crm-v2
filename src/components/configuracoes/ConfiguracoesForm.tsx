"use client";

import { useEffect, useState } from "react";

import {
  obterConfiguracao,
  salvarConfiguracao,
} from "@/services/configuracoes";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ConfiguracoesForm() {

  const [config, setConfig] = useState({

    empresa: "",
    cnpj: "",
    telefone: "",
    whatsapp: "",
    email: "",
    endereco: "",
    cidade: "",
    juros: 0,
    multa: 0,

  });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {

    const dados = await obterConfiguracao();

    if (dados) {

      setConfig({
        empresa: dados.empresa || "",
        cnpj: dados.cnpj || "",
        telefone: dados.telefone || "",
        whatsapp: dados.whatsapp || "",
        email: dados.email || "",
        endereco: dados.endereco || "",
        cidade: dados.cidade || "",
        juros: dados.juros || 0,
        multa: dados.multa || 0,
      });

    }

  }

  function handleChange(e: any) {

    const { name, value } = e.target;

    setConfig((old) => ({
      ...old,
      [name]:
        name === "juros" || name === "multa"
          ? Number(value)
          : value,
    }));

  }

  async function salvar() {

    await salvarConfiguracao(config);

    alert("Configurações salvas com sucesso!");

  }

  return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">

      <h2 className="text-2xl font-bold text-white">
        Configurações da Empresa
      </h2>

      <div>

        <Label>Empresa</Label>

        <Input
          name="empresa"
          value={config.empresa}
          onChange={handleChange}
        />

      </div>

      <div className="grid grid-cols-2 gap-6">

        <div>

          <Label>CNPJ</Label>

          <Input
            name="cnpj"
            value={config.cnpj}
            onChange={handleChange}
          />

        </div>

        <div>

          <Label>Telefone</Label>

          <Input
            name="telefone"
            value={config.telefone}
            onChange={handleChange}
          />

        </div>

      </div>

      <div className="grid grid-cols-2 gap-6">

        <div>

          <Label>WhatsApp</Label>

          <Input
            name="whatsapp"
            value={config.whatsapp}
            onChange={handleChange}
          />

        </div>

        <div>

          <Label>E-mail</Label>

          <Input
            name="email"
            value={config.email}
            onChange={handleChange}
          />

        </div>

      </div>

      <div>

        <Label>Endereço</Label>

        <Input
          name="endereco"
          value={config.endereco}
          onChange={handleChange}
        />

      </div>

      <div>

        <Label>Cidade</Label>

        <Input
          name="cidade"
          value={config.cidade}
          onChange={handleChange}
        />

      </div>

      <div className="grid grid-cols-2 gap-6">

        <div>

          <Label>Juros (%)</Label>

          <Input
            type="number"
            name="juros"
            value={config.juros}
            onChange={handleChange}
          />

        </div>

        <div>

          <Label>Multa (%)</Label>

          <Input
            type="number"
            name="multa"
            value={config.multa}
            onChange={handleChange}
          />

        </div>

      </div>

      <div className="flex justify-end">

        <Button onClick={salvar}>
          Salvar Configurações
        </Button>

      </div>

    </div>

  );

}