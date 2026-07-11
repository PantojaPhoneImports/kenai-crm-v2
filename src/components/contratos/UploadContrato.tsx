"use client";

import { useEffect, useState } from "react";

import {
  Upload,
  Eye,
  Download,
  Trash2,
  FileText,
} from "lucide-react";

import {
  uploadContrato,
  listarContratos,
  excluirContrato,
} from "../../services/contrato";

interface Props {
  clienteId: string;
  socioId: string;
}

export default function UploadContrato({
  clienteId,
  socioId,
}: Props) {

  const [arquivo, setArquivo] = useState<File | null>(null);

  const [observacao, setObservacao] = useState("");

  const [contratos, setContratos] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {

    const lista = await listarContratos(clienteId);

    setContratos(lista);

  }

  async function enviar() {

    if (!arquivo) {

      alert("Selecione um PDF.");

      return;

    }

    try {

      setLoading(true);

      await uploadContrato(
        clienteId,
        socioId,
        arquivo,
        observacao
      );

      setArquivo(null);

      setObservacao("");

      await carregar();

      alert("Contrato enviado com sucesso.");

    } catch (erro) {

      console.error(erro);

      alert("Erro ao enviar contrato.");

    } finally {

      setLoading(false);

    }

  }

  async function apagar(contrato: any) {

    const confirmar = confirm(
      "Excluir este contrato?"
    );

    if (!confirmar) return;

    await excluirContrato(contrato);

    await carregar();

  }

  function abrirContrato(base64: string) {

    const janela = window.open();

    if (janela) {

      janela.document.write(`
        <iframe
          src="${base64}"
          style="width:100%;height:100%;border:none;"
        ></iframe>
      `);

    }

  }

  function baixarContrato(
    base64: string,
    nome: string
  ) {

    const a = document.createElement("a");

    a.href = base64;

    a.download = nome;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

  }

  return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">

      <h2 className="text-2xl font-bold text-white">

        Contratos

      </h2>

      <input

        type="file"

        accept="application/pdf"

        onChange={(e) =>
          setArquivo(
            e.target.files?.[0] || null
          )
        }

        className="block w-full text-white"

      />

      <textarea

        value={observacao}

        onChange={(e) =>
          setObservacao(e.target.value)
        }

        placeholder="Observação (opcional)"

        className="w-full rounded-xl bg-zinc-950 border border-zinc-700 p-4 text-white"

      />

      <button

        onClick={enviar}

        disabled={loading}

        className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl text-white flex items-center gap-2"

      >

        <Upload size={18} />

        {loading
          ? "Enviando..."
          : "Adicionar Contrato"}

      </button>

      <div className="space-y-4">

        {contratos.length === 0 ? (

          <div className="text-center py-10 text-zinc-500">

            Nenhum contrato enviado.

          </div>

        ) : (

          contratos.map((contrato: any) => (

            <div

              key={contrato.id}

              className="border border-zinc-800 rounded-xl p-5 flex items-center justify-between"

            >

              <div className="flex items-center gap-4">

                <FileText
                  className="text-red-400"
                  size={34}
                />

                <div>

                  <p className="text-white font-semibold">

                    {contrato.nome}

                  </p>

                  <p className="text-zinc-500 text-sm">

                    {contrato.observacao || "Sem observação"}

                  </p>

                </div>

              </div>

              <div className="flex gap-3">

                <button

                  onClick={() =>
                    abrirContrato(
                      contrato.arquivo
                    )
                  }

                  className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-3"

                >

                  <Eye size={18} />

                </button>

                <button

                  onClick={() =>
                    baixarContrato(
                      contrato.arquivo,
                      contrato.nome
                    )
                  }

                  className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-3"

                >

                  <Download size={18} />

                </button>

                <button

                  onClick={() =>
                    apagar(contrato)
                  }

                  className="bg-red-600 hover:bg-red-700 rounded-lg p-3"

                >

                  <Trash2 size={18} />

                </button>

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );

}