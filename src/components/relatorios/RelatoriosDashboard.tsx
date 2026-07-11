"use client";

import {
  Users,
  Smartphone,
  DollarSign,
  CreditCard,
  ShoppingBag,
  Receipt,
  Download,
} from "lucide-react";

import RelatoriosCards from "./RelatoriosCards";

const relatorios = [
  {
    titulo: "Clientes",
    descricao: "Lista completa de clientes cadastrados.",
    icone: Users,
  },
  {
    titulo: "Estoque",
    descricao: "Produtos disponíveis e vendidos.",
    icone: Smartphone,
  },
  {
    titulo: "Financeiro",
    descricao: "Resumo financeiro da empresa.",
    icone: DollarSign,
  },
  {
    titulo: "Parcelas",
    descricao: "Parcelas pagas e pendentes.",
    icone: CreditCard,
  },
  {
    titulo: "Vendas",
    descricao: "Histórico completo de vendas.",
    icone: ShoppingBag,
  },
  {
    titulo: "Despesas",
    descricao: "Todas as despesas cadastradas.",
    icone: Receipt,
  },
];

export default function RelatoriosDashboard() {

  function gerarRelatorio(nome: string) {
    alert(
      `O relatório "${nome}" será implementado na próxima etapa.`
    );
  }

  return (

    <div className="space-y-8">

      <div>

        <h1 className="text-4xl font-bold text-white">
          Relatórios
        </h1>

        <p className="text-zinc-400 mt-2">
          Exporte relatórios do sistema.
        </p>

      </div>

      <RelatoriosCards />

      <div className="grid grid-cols-3 gap-6">

        {relatorios.map((relatorio) => {

          const Icon = relatorio.icone;

          return (

            <div
              key={relatorio.titulo}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-blue-600 transition-all"
            >

              <div className="flex justify-between items-center">

                <div>

                  <h2 className="text-2xl font-bold text-white">
                    {relatorio.titulo}
                  </h2>

                  <p className="text-zinc-400 mt-2">
                    {relatorio.descricao}
                  </p>

                </div>

                <div className="bg-zinc-800 rounded-xl p-3">

                  <Icon
                    size={30}
                    className="text-blue-400"
                  />

                </div>

              </div>

              <button
                onClick={() => gerarRelatorio(relatorio.titulo)}
                className="mt-8 w-full bg-blue-600 hover:bg-blue-700 transition rounded-xl py-3 flex items-center justify-center gap-2"
              >

                <Download size={18} />

                Exportar PDF

              </button>

            </div>

          );

        })}

      </div>

    </div>

  );

}