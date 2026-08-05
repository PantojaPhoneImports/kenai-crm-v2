"use client";

import { useEffect, useState } from "react";

import {
  listarUsuarios,
  excluirUsuario,
} from "@/services/usuarios";

import { Trash2, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function UsuariosTable() {

  const { usuario, loading } = useAuth();

  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && usuario?.perfil !== "SOCIO") carregar();
  }, [loading, usuario]);

  async function carregar() {
    const lista = await listarUsuarios();
    setUsuarios(lista);
  }

  async function apagar(id: string) {

    const confirmar = confirm(
      "Deseja excluir este usuário?"
    );

    if (!confirmar) return;

    await excluirUsuario(id);

    carregar();

  }

  return (

    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">

      <table className="w-full">

        <thead className="bg-zinc-800">

          <tr>

            <th className="p-4 text-left">
              Nome
            </th>

            <th className="p-4 text-left">
              Email
            </th>

            <th className="p-4 text-center">
              Cargo
            </th>

            <th className="p-4 text-center">
              Perfil
            </th>

            <th className="p-4 text-center">
              Status
            </th>

            <th className="p-4 text-center">
              Ações
            </th>

          </tr>

        </thead>

        <tbody>

          {usuarios.length === 0 ? (

            <tr>

              <td
                colSpan={6}
                className="text-center py-10 text-zinc-500"
              >

                Nenhum usuário cadastrado.

              </td>

            </tr>

          ) : (

            usuarios.map((usuario: any) => (

              <tr
                key={usuario.id}
                className="border-t border-zinc-800"
              >

                <td className="p-4 text-white">
                  {usuario.nome}
                </td>

                <td className="p-4">
                  {usuario.email}
                </td>

                <td className="p-4 text-center">
                  {usuario.cargo}
                </td>

                <td className="p-4 text-center">
                  {usuario.perfil}
                </td>

                <td className="p-4 text-center">

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      usuario.ativo
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {usuario.ativo
                      ? "Ativo"
                      : "Inativo"}
                  </span>

                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-3">

                    <button
                      className="bg-blue-600 p-2 rounded-lg"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => apagar(usuario.id)}
                      className="bg-red-600 p-2 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>

  );

}
