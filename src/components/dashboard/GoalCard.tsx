import { Progress } from "@/components/ui/progress";

export default function GoalCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h2 className="text-white text-xl font-semibold mb-4">
        Meta do mês
      </h2>

      <h1 className="text-4xl font-bold text-white">
        72%
      </h1>

      <p className="text-zinc-400 mt-2">
        R$ 72.000 de R$ 100.000
      </p>

      <Progress
        value={72}
        className="mt-6"
      />
    </div>
  );
}