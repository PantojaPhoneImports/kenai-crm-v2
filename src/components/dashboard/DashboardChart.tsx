"use client";

import { useEffect, useState } from "react";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts";

const data = [
  { mes: "Jan", vendas: 12000 },
  { mes: "Fev", vendas: 18000 },
  { mes: "Mar", vendas: 15000 },
  { mes: "Abr", vendas: 26000 },
  { mes: "Mai", vendas: 22000 },
  { mes: "Jun", vendas: 34000 },
];

export default function DashboardChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
      <h2 className="text-white text-xl font-semibold mb-6">
        Vendas dos últimos meses
      </h2>

      <div className="h-80">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#27272a" />

              <XAxis
                dataKey="mes"
                stroke="#a1a1aa"
              />

              <Line
                type="monotone"
                dataKey="vendas"
                stroke="#2563eb"
                strokeWidth={4}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
