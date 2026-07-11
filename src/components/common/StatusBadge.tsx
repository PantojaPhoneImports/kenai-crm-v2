interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const cores: Record<string, string> = {
    ESTOQUE: "bg-green-600",
    VENDIDO: "bg-red-600",
    RESERVADO: "bg-yellow-500",
    ATIVO: "bg-green-600",
    INATIVO: "bg-zinc-600",
    PENDENTE: "bg-yellow-500",
    PAGO: "bg-green-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs text-white ${
        cores[status] ?? "bg-zinc-600"
      }`}
    >
      {status}
    </span>
  );
}