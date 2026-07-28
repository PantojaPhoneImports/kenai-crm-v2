"use client";
import { buscarSocio } from "@/services/socios";
import { useEffect, useState } from "react";

import { listarClientes } from "@/services/clientes";
import {
  listarProdutos,
  venderProduto,
} from "@/services/estoque";
import { criarVenda } from "@/services/vendas";
import { criarParcela } from "@/services/parcelas";
import { criarRepasse } from "@/services/repasses";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Cliente } from "@/types/cliente";
import { Produto } from "@/types/produto";

export default function VendaForm() {

  const [clientes, setClientes] =
    useState<Cliente[]>([]);

  const [produtos, setProdutos] =
    useState<Produto[]>([]);

  const [venda, setVenda] = useState({

    clienteId: "",
    clienteNome: "",

    produtoId: "",
    produtoNome: "",

    imei: "",

    socioId: "",
    socioNome: "",
entradaPara: "SOCIO",
    custoProduto: 0,

    valorProduto: 0,

    capitalSocio: 0,

    capitalEmpresa: 0,

    percentualSocio: 0,

    percentualEmpresa: 100,
percentualLucro: 100,
    entrada: 0,

entradaDestino: "SOCIO",

parcelas: 12,

    valorParcela: 0,

    primeiroVencimento:
      new Date()
        .toISOString()
        .split("T")[0],

  });

  useEffect(() => {

    carregarDados();

  }, []);

  async function carregarDados() {

    const listaClientes =
      await listarClientes();

    const listaProdutos =
      await listarProdutos();

    setClientes(listaClientes);

    setProdutos(

      listaProdutos.filter(

        (p: Produto) =>

          p.status === "DISPONIVEL"

      )

    );

  }

  function selecionarCliente(
    id: string
  ) {

    const cliente =
      clientes.find(
        (c) => c.id === id
      );

    if (!cliente) return;

    setVenda((old) => ({

      ...old,

      clienteId:
        cliente.id || "",

      clienteNome:
        cliente.nome,

    }));

  }

  async function selecionarProduto(
    id: string
  ) {

    const produto =
      produtos.find(
        (p) => p.id === id
      );
const socio = produto?.socioId
  ? await buscarSocio(produto.socioId)
  : null;
    if (!produto) return;

    const saldo =
      Number(produto.venda);

    setVenda((old) => ({

      ...old,

      produtoId:
        produto.id || "",

      produtoNome:
        produto.nome,

      imei:
        produto.imei,

      socioId:
        produto.socioId,

      socioNome:
        produto.socioNome,
        tipoSocio:

  produto.tipoSocio,

      custoProduto:
        Number(produto.custo),

      valorProduto:
        Number(produto.venda),

      capitalSocio:
        Number(produto.capitalSocio || 0),

      capitalEmpresa:
        Number(produto.capitalEmpresa || 0),

      percentualSocio:
        Number(produto.percentualSocio || 0),

      percentualEmpresa:
        Number(produto.percentualEmpresa || 100),
percentualLucro:
  Number(socio?.percentualLucro || 100),
      entrada: 0,

      valorParcela:
        saldo /
        old.parcelas,

    }));

  }

  function alterarEntrada(
    valor: string
  ) {

    const entrada =
      Number(valor);

    const saldo =
      venda.valorProduto -
      entrada;

    setVenda((old) => ({

      ...old,

      entrada,

      valorParcela:
        saldo /
        old.parcelas,

    }));

  }

  function alterarParcelas(
    valor: string
  ) {

    const parcelas =
      Number(valor);

    if (parcelas <= 0)
      return;

    const saldo =
      venda.valorProduto -
      venda.entrada;

    setVenda((old) => ({

      ...old,

      parcelas,

      valorParcela:
        saldo /
        parcelas,

    }));

  }
  async function salvarVenda() {

  try {

    const idVenda = await criarVenda({

      ...venda,
entradaDestino:
  venda.entradaDestino,
      data: new Date(),

      status: "ATIVA",

    });

    const lucro =

      venda.valorProduto -

      venda.custoProduto;

    const entradaSocio =
  venda.entradaDestino === "SOCIO"
    ? venda.entrada
    : 0;

const capitalRestante =

  Math.max(

    venda.capitalSocio -

    entradaSocio,

    0

  );

await criarRepasse({

  idVenda,

  clienteNome: venda.clienteNome,

  produto: venda.produtoNome,

  idProduto: venda.produtoId,

  socioId: venda.socioId,

  socioNome: venda.socioNome,

  tipoSocio: venda.tipoSocio,
tipoSocio: "PARCEIRO",
  percentualSocio: venda.percentualSocio,

  percentualLucro: venda.percentualLucro,


  valorTotalVenda:
    venda.valorProduto,

  valorReceber:
    venda.valorProduto -
    venda.entrada,

  capitalInvestido:
    venda.capitalSocio,

  capitalRecuperado:
    entradaSocio,

  capitalRestante:
    capitalRestante,

  capitalPorParcela:

    capitalRestante /

    venda.parcelas,

      lucroTotal:
        lucro,

      
lucroSocioPorParcela:

(
  lucro *
  venda.percentualLucro /
  100
) /
venda.parcelas,

      lucroEmpresaPorParcela:

(
  lucro -

  (
    lucro *
    venda.percentualLucro /
    100
  )

) /
venda.parcelas,

      socioRecebido: 0,

      empresaRecebido: 0,

      totalSocioReceber:

venda.capitalSocio +

(
  lucro *
  venda.percentualLucro /
  100
),

      totalEmpresaReceber:

venda.capitalEmpresa +

(
  lucro -

  (
    lucro *
    venda.percentualLucro /
    100
  )

),

      status: "ATIVO",

      data: new Date(),

    });

    const [ano, mes, dia] =
  venda.primeiroVencimento
    .split("-")
    .map(Number);

const primeira = new Date(
  ano,
  mes - 1,
  dia,
  12,
  0,
  0
);

    for (

      let i = 1;

      i <= venda.parcelas;

      i++

    ) {

      const vencimento =

        new Date(primeira);

      vencimento.setMonth(

        primeira.getMonth() +

        (i - 1)

      );

      await criarParcela({

        vendaId: idVenda,

        clienteId:
          venda.clienteId,

        clienteNome:
          venda.clienteNome,

        produtoId:
          venda.produtoId,

        produtoNome:
          venda.produtoNome,

        socioId:
          venda.socioId,

        socioNome:
          venda.socioNome,

        parcela: i,

        totalParcelas:
          venda.parcelas,

        valor:

          Number(

            venda.valorParcela.toFixed(2)

          ),

        vencimento,

        status: "PENDENTE",

        createdAt:
          new Date(),

      });

    }
await venderProduto(venda.produtoId);
    alert(

      "Venda realizada com sucesso!"

    );

    window.location.href =

      "/vendas";

  } catch (error) {

    console.error(error);

    alert(

      "Erro ao realizar venda."

    );

  }

}
return (

  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">

    <h2 className="text-2xl font-bold text-white">

      Nova Venda

    </h2>

    <div>

      <Label>Cliente</Label>

      <select
        className="w-full mt-2 rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white"
        value={venda.clienteId}
        onChange={(e) =>
          selecionarCliente(e.target.value)
        }
      >

        <option value="">
          Selecione o cliente
        </option>

        {clientes.map((cliente) => (

          <option
            key={cliente.id}
            value={cliente.id}
          >
            {cliente.nome}
          </option>

        ))}

      </select>

    </div>

    <div>

      <Label>Produto</Label>

      <select
        className="w-full mt-2 rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white"
        value={venda.produtoId}
        onChange={(e) =>
          selecionarProduto(e.target.value)
        }
      >

        <option value="">
          Selecione o produto
        </option>

        {produtos.map((produto) => (

          <option
            key={produto.id}
            value={produto.id}
          >
            {produto.nome}
          </option>

        ))}

      </select>

    </div>

    {

      venda.produtoId && (

        <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 space-y-2">

          <p className="text-white">

            <strong>Produto:</strong> {venda.produtoNome}

          </p>

          <p className="text-white">

            <strong>IMEI:</strong> {venda.imei}

          </p>

          <p className="text-white">

            <strong>Investidor:</strong> {venda.socioNome}

          </p>

          <p className="text-green-400 font-bold">

            Valor da venda:
            {" "}
            R$ {venda.valorProduto.toFixed(2)}

          </p>

        </div>

      )

    }

    <div className="grid grid-cols-3 gap-4">

      <div>

  <Label>Entrada</Label>

  <Input
    type="number"
    value={venda.entrada}
    onChange={(e) =>
      alterarEntrada(e.target.value)
    }
  />

  <div className="mt-4">

    <Label>

      Entrada pertence a

    </Label>

    <select

      className="w-full mt-2 rounded-lg bg-zinc-950 border border-zinc-700 p-3 text-white"

      value={venda.entradaDestino}

      onChange={(e) =>

        setVenda((old) => ({

          ...old,

          entradaDestino: e.target.value,

        }))

      }

    >

      <option value="SOCIO">

        Sócio

      </option>

      <option value="EMPRESA">

        Empresa

      </option>

    </select>

  </div>

</div>

      <div>

        <Label>Parcelas</Label>

        <Input
          type="number"
          value={venda.parcelas}
          onChange={(e) =>
            alterarParcelas(e.target.value)
          }
        />

      </div>

      <div>

        <Label>Primeiro Vencimento</Label>

        <Input
          type="date"
          value={venda.primeiroVencimento}
          onChange={(e) =>
            setVenda((old) => ({

              ...old,

              primeiroVencimento:
                e.target.value,

            }))
          }
        />

      </div>

    </div>

    <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-5 space-y-3">

      <div className="flex justify-between">

        <span className="text-zinc-400">

          Valor da Venda

        </span>

        <span className="text-green-400 font-bold">

          R$ {venda.valorProduto.toFixed(2)}

        </span>

      </div>

      <div className="flex justify-between">

        <span className="text-zinc-400">

          Entrada

        </span>

        <span className="text-white">

          R$ {venda.entrada.toFixed(2)}

        </span>

      </div>

      <div className="flex justify-between">

        <span className="text-zinc-400">

          Saldo

        </span>

        <span className="text-yellow-400 font-bold">

          R$

          {" "}

          {(venda.valorProduto - venda.entrada).toFixed(2)}

        </span>

      </div>

      <div className="flex justify-between">

        <span className="text-zinc-400">

          Valor da Parcela

        </span>

        <span className="text-cyan-400 font-bold">

          R$

          {" "}

          {venda.valorParcela.toFixed(2)}

        </span>

      </div>

    </div>

    <Button
      className="w-full"
      onClick={salvarVenda}
    >

      Finalizar Venda

    </Button>

  </div>

);

}