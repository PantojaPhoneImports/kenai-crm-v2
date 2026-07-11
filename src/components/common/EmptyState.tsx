interface Props {
  message: string;
}

export default function EmptyState({
  message,
}: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 py-16 text-center">
      <p className="text-zinc-500">
        {message}
      </p>
    </div>
  );
}