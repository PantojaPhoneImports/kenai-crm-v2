import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import RuntimeDiagnostics from "@/components/common/RuntimeDiagnostics";

export const metadata: Metadata = {
  title: {
    default: "KENAI CRM",
    template: "%s | KENAI CRM",
  },

  description: "Sistema de Gestão • Pantoja Phone Imports",

  applicationName: "KENAI CRM",

  authors: [
    {
      name: "Pantoja Phone Imports",
    },
  ],

  keywords: [
    "CRM",
    "Financeiro",
    "Parcelas",
    "Clientes",
    "Pantoja",
    "Celulares",
  ],

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
    >
      <body className="bg-zinc-950 text-white antialiased">
        <Providers>
          <RuntimeDiagnostics origem="RootLayout" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
