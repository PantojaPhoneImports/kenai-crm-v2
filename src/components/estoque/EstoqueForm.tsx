"use client";
import { Produto } from "@/types/produto";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { criarProduto } from "@/services/estoque";
import { listarSocios } from "@/services/socios";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function EstoqueForm() {

  const router = useRouter();

  const [socios, setSocios] =
    useState<any[]>([]);


  const [produto, setProduto] =
  useState<Produto>({

      nome: "",

      imei: "",

      marca: "",

      modelo: "",

      cor: "",

      capacidade: "",

      fornecedor: "",

      custo: 0,

      venda: 0,

      status: "DISPONIVEL" as const,

      socioId: "",

      socioNome: "",
tipoSocio: "PARCEIRO",

      capitalSocio: 0,

      capitalEmpresa: 0,

      percentualSocio: 0,

      percentualEmpresa: 100,

    });



  useEffect(()=>{

    carregarSocios();

  },[]);



  async function carregarSocios(){

    const dados =
      await listarSocios();

    setSocios(dados);

  }



  function handleChange(
    e:any
  ){

    const {
      name,
      value
    } = e.target;


    setProduto((old)=>({

      ...old,


      [name]:

        [
          "custo",
          "venda",
          "capitalSocio",
          "capitalEmpresa"
        ].includes(name)

        ? Number(value)

        : value,


    }));

  }



  function alterarCapitalSocio(
    valor:string
  ){

    const capitalSocio =
      Number(valor);


    const capitalEmpresa =
      produto.custo -
      capitalSocio;


    const percentualSocio =
      produto.custo > 0

      ? (capitalSocio /
          produto.custo) * 100

      : 0;


    setProduto((old)=>({

      ...old,

      capitalSocio,

      capitalEmpresa,

      percentualSocio,

      percentualEmpresa:
        100 - percentualSocio,

    }));

  }



  async function salvarProduto(){

    try{


      await criarProduto(
        produto
      );


      alert(
        "Produto cadastrado com sucesso!"
      );


      router.push(
        "/estoque"
      );


    }catch(error){

      console.error(error);

      alert(
        "Erro ao cadastrar produto."
      );

    }

  }



  return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">


      <h2 className="text-2xl font-bold text-white">

        Cadastro de Produto

      </h2>



      <div>

        <Label>
          Nome do Produto
        </Label>

        <Input
          name="nome"
          value={produto.nome}
          onChange={handleChange}
        />

      </div>



      <div className="grid grid-cols-2 gap-6">


        <div>

          <Label>
            IMEI
          </Label>

          <Input
            name="imei"
            value={produto.imei}
            onChange={handleChange}
          />

        </div>


        <div>

          <Label>
            Marca
          </Label>

          <Input
            name="marca"
            value={produto.marca}
            onChange={handleChange}
          />

        </div>


      </div>



      <div className="grid grid-cols-2 gap-6">


        <div>

          <Label>
            Modelo
          </Label>

          <Input
            name="modelo"
            value={produto.modelo}
            onChange={handleChange}
          />

        </div>


        <div>

          <Label>
            Cor
          </Label>

          <Input
            name="cor"
            value={produto.cor}
            onChange={handleChange}
          />

        </div>


      </div>



      <div className="grid grid-cols-2 gap-6">


        <div>

          <Label>
            Custo
          </Label>

          <Input
            type="number"
            name="custo"
            value={produto.custo}
            onChange={handleChange}
          />

        </div>


        <div>

          <Label>
            Venda
          </Label>

          <Input
            type="number"
            name="venda"
            value={produto.venda}
            onChange={handleChange}
          />

        </div>


      </div>




      <div>

        <Label>
          Sócio Investidor
        </Label>


        <select

          value={produto.socioId}

          onChange={(e)=>{

            const socio =
              socios.find(
                s=>s.id === e.target.value
              );


            setProduto((old)=>({

              ...old,

              socioId:
                socio?.id || "",

              socioNome:
                socio?.nome || "",
tipoSocio:
  (socio?.tipo as "PARCEIRO" | "INVESTIDOR") || "PARCEIRO",
            }));

          }}

          className="w-full h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-white"

        >

          <option value="">
            Sem sócio
          </option>


          {socios.map((socio)=>(

            <option
              key={socio.id}
              value={socio.id}
            >

              {socio.nome}

            </option>

          ))}


        </select>


      </div>




      <div className="grid grid-cols-2 gap-6">


        <div>

          <Label>
  Capital Investido pelo Sócio (R$)
</Label>


          <Input

            type="number"

            value={produto.capitalSocio}

            onChange={(e)=>
              alterarCapitalSocio(
                e.target.value
              )
            }

          />


        </div>



        <div>

          <Label>
  Capital Investido pela Empresa (R$)
</Label>


          <Input

            type="number"

            value={produto.capitalEmpresa}

            disabled

          />


        </div>


      </div>




      <div className="grid grid-cols-2 gap-6">


        <div>

          <Label>
  Participação do Sócio
</Label>


          <Input

            value={
              produto.percentualSocio.toFixed(2)
            }

            disabled

          />


        </div>



        <div>

          <Label>
  Participação da Empresa
</Label>


          <Input

            value={
              produto.percentualEmpresa.toFixed(2)
            }

            disabled

          />


        </div>


      </div>




      <div className="flex justify-end gap-3">


        <Button

          variant="outline"

          onClick={()=>
            router.push("/estoque")
          }

        >

          Cancelar

        </Button>



        <Button
          onClick={salvarProduto}
        >

          Salvar Produto

        </Button>


      </div>


    </div>

  );

}