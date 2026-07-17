export default function PaginaTeste() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">

      <h1 className="text-4xl font-bold">
        Área de Testes do Kenai CRM
      </h1>

      <p className="mt-4 text-zinc-400">
        Utilize esta página para testar os módulos antes do deploy.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-6">

        <a
          href="/socios"
          className="rounded-xl bg-zinc-900 p-6 border border-zinc-800 hover:border-blue-500"
        >
          👥 Sócios
        </a>

        <a
          href="/estoque"
          className="rounded-xl bg-zinc-900 p-6 border border-zinc-800 hover:border-green-500"
        >
          📦 Estoque
        </a>

        <a
          href="/clientes"
          className="rounded-xl bg-zinc-900 p-6 border border-zinc-800 hover:border-yellow-500"
        >
          👤 Clientes
        </a>

        <a
          href="/vendas"
          className="rounded-xl bg-zinc-900 p-6 border border-zinc-800 hover:border-red-500"
        >
          💰 Vendas
        </a>

        <a
          href="/financeiro"
          className="rounded-xl bg-zinc-900 p-6 border border-zinc-800 hover:border-purple-500"
        >
          📈 Financeiro
        </a>

        <a
          href="/parcelas"
          className="rounded-xl bg-zinc-900 p-6 border border-zinc-800 hover:border-cyan-500"
        >
          📅 Parcelas
        </a>

      </div>

    </div>
  );
}