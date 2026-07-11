import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Wallet,
  FileText,
  Building2,
  Settings,
  CreditCard,
  Landmark,
  Receipt,
  BarChart3,
  UserCog,
} from "lucide-react";

export const menu = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    title: "Estoque",
    href: "/estoque",
    icon: Package,
  },
  {
    title: "Vendas",
    href: "/vendas",
    icon: ShoppingCart,
  },
  {
    title: "Parcelas",
    href: "/parcelas",
    icon: CreditCard,
  },
  {
    title: "Financeiro",
    href: "/financeiro",
    icon: Wallet,
  },
  {
    title: "Fluxo de Caixa",
    href: "/caixa",
    icon: Landmark,
  },
  {
    title: "Despesas",
    href: "/despesas",
    icon: Receipt,
  },
  {
    title: "Contratos",
    href: "/contratos",
    icon: FileText,
  },
  {
    title: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
  },
  {
    title: "Sócios",
    href: "/socios",
    icon: Building2,
  },
  {
    title: "Usuários",
    href: "/usuarios",
    icon: UserCog,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];