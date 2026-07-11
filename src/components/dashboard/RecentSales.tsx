export default function RecentSales() {
  const vendas = [
    {
      cliente: "João Pedro",
      aparelho: "iPhone 15 Pro",
      valor: "R$ 5.800",
    },
    {
      cliente: "Maria Silva",
      aparelho: "iPhone 14",
      valor: "R$ 4.200",
    },
    {
      cliente: "Carlos Henrique",
      aparelho: "iPhone 13",
      valor: "R$ 3.900",
    },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h2 className="text-white text-xl font-semibold mb-6">
        Últimas vendas
      </h2>

      <div className="space-y-4">
        {vendas.map((venda) => (
          <div
            key={venda.cliente}
            className="flex justify-between items-center border-b border-zinc-800 pb-3"
          >
            <div>
              <h3 className="text-white font-semibold">
                {venda.cliente}
              </h3>

              <p className="text-zinc-400 text-sm">
                {venda.aparelho}
              </p>
            </div>

            <span className="text-green-500 font-bold">
              {venda.valor}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}