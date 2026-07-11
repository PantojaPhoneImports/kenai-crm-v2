export default function LowStock() {
  const produtos = [
    "iPhone 15 Pro Max",
    "iPhone 14",
    "Carregador Original",
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h2 className="text-white text-xl font-semibold mb-6">
        Estoque baixo
      </h2>

      <div className="space-y-3">
        {produtos.map((produto) => (
          <div
            key={produto}
            className="flex justify-between"
          >
            <span className="text-zinc-300">
              {produto}
            </span>

            <span className="text-red-500 font-semibold">
              Baixo
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}