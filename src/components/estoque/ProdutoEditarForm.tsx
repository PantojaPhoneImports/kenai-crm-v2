"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Produto } from "@/types/produto";
import {
  listarProdutos,
  editarProduto,
} from "@/services/estoque";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProdutoEditarForm() {

  const router = useRouter();

  const params = useParams();

  const [loading, setLoading] = useState(true);

  const [produto, setProduto] = useState<Produto>({
  nome: "",
  imei: "",
  marca: "",
  modelo: "",
  cor: "",
  capacidade: "",
  fornecedor: "",
  custo: 0,
  venda: 0,

  capitalSocio: 0,
  capitalEmpresa: 0,
  percentualSocio: 0,
  percentualEmpresa: 100,

  status: "DISPONIVEL",

  socioId: "",

socioNome: "",

tipoSocio: "PARCEIRO",
});

  useEffect(() => {
    carregarProduto();
  }, []);

  async function carregarProduto() {

    const produtos = await listarProdutos();

    const encontrado = produtos.find(
      (p: any) => p.id === params.id
    );

    if (!encontrado) return;

    setProduto({
  nome: encontrado.nome || "",
  imei: encontrado.imei || "",
  marca: encontrado.marca || "",
  modelo: encontrado.modelo || "",
  cor: encontrado.cor || "",
  capacidade: encontrado.capacidade || "",
  fornecedor: encontrado.fornecedor || "",
  custo: encontrado.custo || 0,
  venda: encontrado.venda || 0,

  capitalSocio: encontrado.capitalSocio || 0,
  capitalEmpresa: encontrado.capitalEmpresa || 0,
  percentualSocio: encontrado.percentualSocio || 0,
  percentualEmpresa: encontrado.percentualEmpresa || 100,

  status: encontrado.status || "DISPONIVEL",

  socioId: encontrado.socioId || "",
  socioNome: encontrado.socioNome || "",
  tipoSocio: encontrado.tipoSocio || "PARCEIRO",
});

    setLoading(false);

  }

  function handleChange(e: any) {

    const { name, value } = e.target;

    setProduto((old) => ({
      ...old,
      [name]:
        name === "custo" || name === "venda"
          ? Number(value)
          : value,
    }));

  }

  async function salvar() {

    await editarProduto(
      params.id as string,
      produto
    );

    alert("Produto atualizado com sucesso!");

    router.push("/estoque");

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
        Editar Produto
      </h2>

      <div>

        <Label>Nome</Label>

        <Input
          name="nome"
          value={produto.nome}
          onChange={handleChange}
        />

      </div>

      <div className="grid grid-cols-2 gap-6">

        <div>

          <Label>IMEI</Label>

          <Input
            name="imei"
            value={produto.imei}
            onChange={handleChange}
          />

        </div>

        <div>

          <Label>Marca</Label>

          <Input
            name="marca"
            value={produto.marca}
            onChange={handleChange}
          />

        </div>

      </div>

      <div className="grid grid-cols-2 gap-6">

        <div>

          <Label>Modelo</Label>

          <Input
            name="modelo"
            value={produto.modelo}
            onChange={handleChange}
          />

        </div>

        <div>

          <Label>Cor</Label>

          <Input
            name="cor"
            value={produto.cor}
            onChange={handleChange}
          />

        </div>

      </div>

      <div className="grid grid-cols-2 gap-6">

        <div>

          <Label>Capacidade</Label>

          <Input
            name="capacidade"
            value={produto.capacidade}
            onChange={handleChange}
          />

        </div>

        <div>

          <Label>Fornecedor</Label>

          <Input
            name="fornecedor"
            value={produto.fornecedor}
            onChange={handleChange}
          />

        </div>

      </div>

      <div className="grid grid-cols-2 gap-6">

        <div>

          <Label>Custo</Label>

          <Input
            type="number"
            name="custo"
            value={produto.custo}
            onChange={handleChange}
          />

        </div>

        <div>

          <Label>Preço de Venda</Label>

          <Input
            type="number"
            name="venda"
            value={produto.venda}
            onChange={handleChange}
          />

        </div>

      </div>

      <div className="flex justify-end gap-3">

        <Button
          variant="outline"
          onClick={() => router.push("/estoque")}
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