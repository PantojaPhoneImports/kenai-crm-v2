"use client";

import { useAuth } from "@/contexts/AuthContext";
import { usuarioEhSocio } from "@/lib/socio";
import DashboardCards from "./DashboardCards";
import DashboardChart from "./DashboardChart";
import UltimasVendas from "./UltimasVendas";
import ProximosVencimentos from "./ProximosVencimentos";
import DiagnosticErrorBoundary from "@/components/common/DiagnosticErrorBoundary";

export default function DashboardContent() {
  const { usuario, loading } = useAuth();
  if (loading) return <div className="h-36 animate-pulse rounded-2xl bg-zinc-900" />;
  if (usuarioEhSocio(usuario)) return <DiagnosticErrorBoundary nome="DashboardCards"><DashboardCards /></DiagnosticErrorBoundary>;
  return <><DiagnosticErrorBoundary nome="DashboardCards"><DashboardCards /></DiagnosticErrorBoundary><DiagnosticErrorBoundary nome="DashboardChart"><DashboardChart /></DiagnosticErrorBoundary><div className="grid grid-cols-2 gap-8"><DiagnosticErrorBoundary nome="UltimasVendas"><UltimasVendas /></DiagnosticErrorBoundary><DiagnosticErrorBoundary nome="ProximosVencimentos"><ProximosVencimentos /></DiagnosticErrorBoundary></div></>;
}
