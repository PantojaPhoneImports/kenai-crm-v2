"use client";

import { useState } from "react";

import Layout from "@/components/layout/Layout";
import UsuariosTable from "@/components/usuarios/UsuariosTable";

import { criarUsuario } from "@/services/usuarios";

export default function UsuariosPage() {

  const [nome, setNome] = useState("");

  const [email, setEmail] = useState("");

  const [cargo, setCargo] = useState("");

  const [perfil, setPerfil] = useState("Administrador");

  const [ativo, setAtivo] = useState(true);

  async function salvar() {

    if (!nome || !email) {

      alert("Preencha Nome e Email.");

      return;

    }

    await criarUsuario({

      nome,

      email,

      cargo,

      perfil,

      ativo,

    });

    alert("Usuário cadastrado com sucesso.");

    window.location.reload();

  }

  return (

    <Layout>

      <div className="space-y-8">

        <div>

          <h1 className="text-4xl font-bold text-white">

            Usuários

          </h1>

          <p className="text-zinc-400 mt-2">

            Gerenciamento de usuários do sistema

          </p>

        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">

          <div className="grid grid-cols-2 gap-6">

            <input
              placeholder="Nome"
              value={nome}
              onChange={(e)=>setNome(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-white"
            />

            <input
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-white"
            />

            <input
              placeholder="Cargo"
              value={cargo}
              onChange={(e)=>setCargo(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-white"
            />

            <select
              value={perfil}
              onChange={(e)=>setPerfil(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-white"
            >

              <option>Administrador</option>

              <option>Funcionário</option>

            </select>

          </div>

          <div className="flex items-center gap-3 mt-6">

            <input
              type="checkbox"
              checked={ativo}
              onChange={(e)=>setAtivo(e.target.checked)}
            />

            <span className="text-white">

              Usuário Ativo

            </span>

          </div>

          <button

            onClick={salvar}

            className="mt-8 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-white"

          >

            Salvar Usuário

          </button>

        </div>

        <UsuariosTable />

      </div>

    </Layout>

  );

}