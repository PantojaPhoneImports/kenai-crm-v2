"use client";

import { useEffect, useState } from "react";

import { listarClientes } from "@/services/clientes";
import { listarProdutos, venderProduto } from "@/services/estoque";
import { criarVenda } from "@/services/vendas";
import { criarParcela } from "@/services/parcelas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Cliente } from "@/types/cliente";
import { Produto } from "@/types/produto";

export default function VendaForm() {

  const hoje = new Date().toISOString().split("T")[0];

  const proximoMes = new Date();

  proximoMes.setMonth(proximoMes.getMonth() + 1);

  const primeiroVencimento =
    proximoMes.toISOString().split("T")[0];

  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [venda, setVenda] = useState({

    clienteId: "",

    clienteNome: "",

    produtoId: "",

    produtoNome: "",

    imei: "",

    socioId: "",

    socioNome: "",

    valorProduto: 0,

    entrada: "",

    saldo: 0,

    parcelas: 24,

    valorParcela: 0,

    formaPagamento: "Carnê",

    dataVenda: hoje,

    primeiroVencimento,

    observacao: "",

    status: "ABERTA",

  });

  useEffect(() => {

    carregarDados();

  }, []);

  async function carregarDados() {

    const listaClientes = await listarClientes();

    const listaProdutos = await listarProdutos();

    setClientes(listaClientes);

    setProdutos(

      listaProdutos.filter(

        (produto) => produto.status === "DISPONIVEL"

      )

    );

  }

  function selecionarCliente(id: string) {

    const cliente = clientes.find(

      (c) => c.id === id

    );

    if (!cliente) return;

    setVenda((old) => ({

      ...old,

      clienteId: cliente.id || "",

      clienteNome: cliente.nome,

    }));

  }

  function selecionarProduto(id: string) {

    const produto = produtos.find(

      (p) => p.id === id

    );

    if (!produto) return;

    const valor = Number(produto.venda);

    setVenda((old) => ({

      ...old,

      produtoId: produto.id || "",

      produtoNome: produto.nome,

      imei: produto.imei,

      socioId: produto.socioId,

      socioNome: produto.socioNome,

      valorProduto: valor,

      entrada: "",

      saldo: valor,

      valorParcela: valor / old.parcelas,

    }));

  }
    function alterarEntrada(valor: string) {

    const somenteNumero = valor.replace(/\D/g, "");

    const entrada = Number(somenteNumero);

    const saldo = venda.valorProduto - entrada;

    setVenda((old) => ({

      ...old,

      entrada: somenteNumero,

      saldo,

      valorParcela: saldo / old.parcelas,

    }));

  }

  function alterarParcelas(valor: string) {

    const parcelas = Number(valor);

    if (!parcelas) return;

    setVenda((old) => ({

      ...old,

      parcelas,

      valorParcela: old.saldo / parcelas,

    }));

  }

  async function salvarVenda() {

    const entrada = Number(venda.entrada);

    if (!venda.clienteId) {

      alert("Selecione um cliente.");

      return;

    }

    if (!venda.produtoId) {

      alert("Selecione um produto.");

      return;

    }

    if (entrada > venda.valorProduto) {

      alert("A entrada não pode ser maior que o valor do produto.");

      return;

    }

    try {

      await criarVenda({

        ...venda,

        entrada,

        createdAt: new Date(venda.dataVenda),

      });

      await venderProduto(venda.produtoId);

      const dataBase = new Date(venda.primeiroVencimento);

      for (let i = 1; i <= venda.parcelas; i++) {

        const vencimento = new Date(dataBase);

        vencimento.setMonth(

          dataBase.getMonth() + (i - 1)

        );

        await criarParcela({

          clienteNome: venda.clienteNome,

          produtoNome: venda.produtoNome,

          parcela: i,

          totalParcelas: venda.parcelas,

          valor: Number(venda.valorParcela.toFixed(2)),

          vencimento,

          status: "PENDENTE",

          createdAt: new Date(),

        });

      }

      alert("Venda realizada com sucesso!");

      window.location.href = "/vendas";

    } catch (error) {

      console.error(error);

      alert("Erro ao realizar venda.");

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
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white"
          onChange={(e) => selecionarCliente(e.target.value)}
        >

          <option value="">

            Selecione...

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
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white"
          onChange={(e) => selecionarProduto(e.target.value)}
        >

          <option value="">

            Selecione...

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

      {venda.produtoId && (

        <div className="rounded-xl border border-blue-700 bg-blue-950/20 p-5 space-y-2">

          <h3 className="text-lg font-bold text-blue-400">

            Informações do Aparelho

          </h3>

          <p className="text-zinc-300">

            <strong>Produto:</strong> {venda.produtoNome}

          </p>

          <p className="text-zinc-300">

            <strong>IMEI:</strong> {venda.imei}

          </p>

          <p className="text-zinc-300">

            <strong>Proprietário:</strong> 👤 {venda.socioNome}

          </p>

          <p className="text-green-400 font-bold">

            Valor: R$ {venda.valorProduto.toFixed(2)}

          </p>

        </div>

      )}

      <div className="flex justify-end">

        <Button onClick={salvarVenda}>

          Finalizar Venda

        </Button>

      </div>

    </div>

  );

}